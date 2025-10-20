/**
 * WalletManager - Core wallet management and transaction handling
 * 
 * Provides secure interface for blockchain operations with
 * built-in safety mechanisms and multi-chain support.
 */

import {
  Chain,
  WalletConnection,
  WalletManagerOptions,
  WalletProvider,
  TransactionRequest,
  TransactionReceipt,
  Balance,
  TokenBalance,
  GasEstimate,
  FunctionCallResult,
  ConnectionError,
  TransactionError,
  ValidationError,
} from './types';
import { createPublicClient, createWalletClient, custom, http, formatEther, parseEther } from 'viem';
import type { PublicClient, WalletClient, Address, Hash } from 'viem';

export class WalletManager {
  private chains: Chain[];
  private currentChain: Chain;
  private connection: WalletConnection | null = null;
  private publicClient: PublicClient | null = null;
  private walletClient: WalletClient | null = null;
  private confirmations: number;

  constructor(options: WalletManagerOptions) {
    this.chains = options.chains;
    this.currentChain = options.defaultChain;
    this.confirmations = options.confirmations || 1;

    if (options.autoConnect) {
      this.autoConnect();
    }
  }

  /**
   * Connect to wallet provider
   */
  async connect(provider: WalletProvider = 'metamask'): Promise<WalletConnection> {
    try {
      // Check if window.ethereum exists
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new ConnectionError('No Web3 provider detected. Please install MetaMask.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new ConnectionError('No accounts found. Please unlock your wallet.');
      }

      const address = accounts[0];
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      const chainIdNumber = parseInt(chainId, 16);

      // Initialize clients
      this.publicClient = createPublicClient({
        chain: this.currentChain as any,
        transport: http(),
      }) as PublicClient;

      this.walletClient = createWalletClient({
        chain: this.currentChain as any,
        transport: custom(window.ethereum),
      });

      this.connection = {
        address,
        chainId: chainIdNumber,
        provider,
        connected: true,
      };

      // Setup event listeners
      this.setupEventListeners();

      return this.connection;
    } catch (error: any) {
      throw new ConnectionError(`Failed to connect wallet: ${error.message}`, error);
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    this.connection = null;
    this.publicClient = null;
    this.walletClient = null;
  }

  /**
   * Get current connection status
   */
  getConnection(): WalletConnection | null {
    return this.connection;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.connection?.connected || false;
  }

  /**
   * Get native token balance
   */
  async getBalance(address?: string): Promise<Balance> {
    this.ensureConnected();
    
    const targetAddress = (address || this.connection!.address) as Address;
    
    if (!this.publicClient) {
      throw new ConnectionError('Public client not initialized');
    }

    const balance = await this.publicClient.getBalance({
      address: targetAddress,
    });

    return {
      value: balance,
      formatted: formatEther(balance),
      symbol: this.currentChain.nativeCurrency.symbol,
      decimals: this.currentChain.nativeCurrency.decimals,
    };
  }

  /**
   * Get ERC-20 token balance
   */
  async getTokenBalance(tokenAddress: string, ownerAddress?: string): Promise<TokenBalance> {
    this.ensureConnected();
    
    const owner = (ownerAddress || this.connection!.address) as Address;
    
    if (!this.publicClient) {
      throw new ConnectionError('Public client not initialized');
    }

    // ERC-20 balanceOf ABI
    const balanceOfAbi = [
      {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const;

    const balance = await this.publicClient.readContract({
      address: tokenAddress as Address,
      abi: balanceOfAbi,
      functionName: 'balanceOf',
      args: [owner],
    });

    // Get token metadata (name, symbol, decimals)
    // Simplified version - in production would batch these calls
    return {
      value: balance as bigint,
      formatted: formatEther(balance as bigint),
      symbol: 'TOKEN', // Would fetch from contract
      decimals: 18, // Would fetch from contract
      tokenAddress,
      tokenName: 'Token', // Would fetch from contract
      tokenSymbol: 'TOKEN', // Would fetch from contract
    };
  }

  /**
   * Send native tokens
   */
  async sendNative(to: string, amount: string): Promise<TransactionReceipt> {
    this.ensureConnected();
    
    if (!this.walletClient) {
      throw new ConnectionError('Wallet client not initialized');
    }

    if (!this.isValidAddress(to)) {
      throw new ValidationError('Invalid recipient address');
    }

    const value = parseEther(amount);

    const hash = await this.walletClient.sendTransaction({
      to: to as Address,
      value,
      chain: this.currentChain as any,
      account: this.connection!.address as Address,
    });

    return this.waitForTransaction(hash);
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(tx: TransactionRequest): Promise<GasEstimate> {
    this.ensureConnected();
    
    if (!this.publicClient) {
      throw new ConnectionError('Public client not initialized');
    }

    const gasLimit = await this.publicClient.estimateGas({
      to: tx.to as Address,
      value: tx.value,
      data: tx.data,
    });

    const gasPrice = await this.publicClient.getGasPrice();

    const estimatedCost = gasLimit * gasPrice;

    return {
      gasLimit,
      gasPrice,
      maxFeePerGas: gasPrice,
      maxPriorityFeePerGas: gasPrice / 10n, // Simplified
      estimatedCost,
      estimatedCostFormatted: formatEther(estimatedCost),
    };
  }

  /**
   * Switch to different chain
   */
  async switchChain(chainId: number): Promise<void> {
    this.ensureConnected();

    const chain = this.chains.find(c => c.id === chainId);
    if (!chain) {
      throw new ValidationError(`Chain ${chainId} not configured`);
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });

      this.currentChain = chain;
      
      // Reinitialize clients
      this.publicClient = createPublicClient({
        chain: this.currentChain as any,
        transport: http(),
      }) as PublicClient;

      this.walletClient = createWalletClient({
        chain: this.currentChain as any,
        transport: custom(window.ethereum),
      });
    } catch (error: any) {
      throw new TransactionError(`Failed to switch chain: ${error.message}`, error);
    }
  }

  /**
   * Execute LLM function call
   */
  async executeFunction(
    functionName: string,
    params: any
  ): Promise<FunctionCallResult> {
    try {
      // Map function names to handlers
      switch (functionName) {
        case 'get_balance':
          const balance = await this.getBalance(params.address);
          return {
            success: true,
            data: balance,
          };

        case 'get_wallet_address':
          return {
            success: true,
            data: { address: this.connection?.address },
          };

        case 'send_native':
          const receipt = await this.sendNative(params.to, params.amount);
          return {
            success: true,
            data: receipt,
            transactionHash: receipt.transactionHash,
            receipt,
          };

        case 'estimate_gas':
          const estimate = await this.estimateGas(params);
          return {
            success: true,
            data: estimate,
          };

        case 'validate_address':
          const isValid = this.isValidAddress(params.address);
          return {
            success: true,
            data: { valid: isValid, address: params.address },
          };

        default:
          return {
            success: false,
            error: `Unknown function: ${functionName}`,
          };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate Ethereum address
   */
  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Wait for transaction confirmation
   */
  private async waitForTransaction(hash: Hash): Promise<TransactionReceipt> {
    if (!this.publicClient) {
      throw new ConnectionError('Public client not initialized');
    }

    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash,
      confirmations: this.confirmations,
    });

    return {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      from: receipt.from,
      to: receipt.to || null,
      contractAddress: receipt.contractAddress || null,
      status: receipt.status === 'success' ? 'success' : 'reverted',
      gasUsed: receipt.gasUsed,
      effectiveGasPrice: receipt.effectiveGasPrice,
    };
  }

  /**
   * Auto-connect if previously connected
   */
  private async autoConnect(): Promise<void> {
    // Implementation would check localStorage for previous connection
    // and attempt to reconnect
  }

  /**
   * Setup wallet event listeners
   */
  private setupEventListeners(): void {
    if (!window.ethereum) return;

    // Handle account changes
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else if (this.connection) {
        this.connection.address = accounts[0];
      }
    });

    // Handle chain changes
    window.ethereum.on('chainChanged', (chainId: string) => {
      const chainIdNumber = parseInt(chainId, 16);
      if (this.connection) {
        this.connection.chainId = chainIdNumber;
      }
      // Reload to ensure proper state
      window.location.reload();
    });

    // Handle disconnect
    window.ethereum.on('disconnect', () => {
      this.disconnect();
    });
  }

  /**
   * Ensure wallet is connected
   */
  private ensureConnected(): void {
    if (!this.isConnected()) {
      throw new ConnectionError('Wallet not connected. Call connect() first.');
    }
  }
}

// Type augmentation for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
