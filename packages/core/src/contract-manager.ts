/**
 * ContractManager - Smart Contract Interaction Layer
 * 
 * Provides type-safe interface for interacting with smart contracts,
 * including ABI encoding/decoding, read/write operations, and event monitoring.
 */

import {
  Chain,
  WalletConnection,
  TransactionReceipt,
  ConnectionError,
  TransactionError,
  ValidationError,
} from './types';
import {
  createPublicClient,
  http,
  parseAbi,
  encodeFunctionData,
  decodeFunctionResult,
  decodeEventLog,
} from 'viem';
import type {
  PublicClient,
  WalletClient,
  Address,
  Abi,
  Log,
} from 'viem';

export interface ContractConfig {
  address: string;
  abi: Abi | string[];
  name?: string;
}

export interface ContractCallParams {
  functionName: string;
  args?: any[];
  value?: bigint;
  gasLimit?: bigint;
}

export interface ContractReadResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ContractWriteResult extends TransactionReceipt {
  decodedLogs?: any[];
}

export interface EventFilter {
  eventName: string;
  fromBlock?: bigint;
  toBlock?: bigint;
  args?: Record<string, any>;
}

export interface DecodedEvent {
  eventName: string;
  args: Record<string, any>;
  blockNumber: bigint;
  transactionHash: string;
  logIndex: number;
}

/**
 * Smart Contract Manager
 * 
 * Handles all smart contract interactions including:
 * - Read operations (view/pure functions)
 * - Write operations (state-changing transactions)
 * - Event querying and decoding
 * - Multi-contract batching
 */
export class ContractManager {
  private publicClient: PublicClient | null = null;
  private walletClient: WalletClient | null = null;
  private connection: WalletConnection | null = null;
  private contracts: Map<string, ContractConfig> = new Map();
  private chain: Chain;

  constructor(chain: Chain) {
    this.chain = chain;
    this.initializePublicClient();
  }

  /**
   * Initialize public client for read operations
   */
  private initializePublicClient(): void {
    this.publicClient = createPublicClient({
      chain: this.chain as any,
      transport: http(),
    }) as PublicClient;
  }

  /**
   * Set wallet connection for write operations
   */
  setConnection(connection: WalletConnection, walletClient: WalletClient): void {
    this.connection = connection;
    this.walletClient = walletClient;
  }

  /**
   * Register a contract for easier access
   */
  registerContract(config: ContractConfig): void {
    if (!this.isValidAddress(config.address)) {
      throw new ValidationError('Invalid contract address');
    }
    this.contracts.set(config.address.toLowerCase(), config);
  }

  /**
   * Get registered contract
   */
  getContract(address: string): ContractConfig | undefined {
    return this.contracts.get(address.toLowerCase());
  }

  /**
   * Read from contract (view/pure functions)
   */
  async read(
    contractAddress: string,
    functionName: string,
    args: any[] = [],
    abi?: Abi | string[]
  ): Promise<ContractReadResult> {
    try {
      if (!this.publicClient) {
        throw new ConnectionError('Public client not initialized');
      }

      // Get ABI from registered contract or use provided
      const contract = this.getContract(contractAddress);
      const contractAbi = abi || contract?.abi;

      if (!contractAbi) {
        throw new ValidationError('Contract ABI not provided or registered');
      }

      // Parse ABI if string array
      const parsedAbi = typeof contractAbi[0] === 'string' 
        ? parseAbi(contractAbi as string[])
        : contractAbi as Abi;

      const result = await this.publicClient.readContract({
        address: contractAddress as Address,
        abi: parsedAbi,
        functionName,
        args,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Write to contract (state-changing functions)
   */
  async write(
    contractAddress: string,
    functionName: string,
    args: any[] = [],
    options: {
      value?: bigint;
      gasLimit?: bigint;
      abi?: Abi | string[];
    } = {}
  ): Promise<ContractWriteResult> {
    try {
      this.ensureConnected();

      if (!this.publicClient || !this.walletClient) {
        throw new ConnectionError('Clients not initialized');
      }

      // Get ABI
      const contract = this.getContract(contractAddress);
      const contractAbi = options.abi || contract?.abi;

      if (!contractAbi) {
        throw new ValidationError('Contract ABI not provided or registered');
      }

      const parsedAbi = typeof contractAbi[0] === 'string'
        ? parseAbi(contractAbi as string[])
        : contractAbi as Abi;

      // Simulate transaction first
      try {
        await this.publicClient.simulateContract({
          address: contractAddress as Address,
          abi: parsedAbi,
          functionName,
          args,
          value: options.value,
          account: this.connection!.address as Address,
        });
      } catch (simError: any) {
        throw new TransactionError(
          `Transaction simulation failed: ${simError.message}`,
          simError
        );
      }

      // Execute transaction
      const hash = await this.walletClient.writeContract({
        address: contractAddress as Address,
        abi: parsedAbi,
        functionName,
        args,
        value: options.value,
        gas: options.gasLimit,
        chain: this.chain as any,
        account: this.connection!.address as Address,
      });

      // Wait for receipt
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
      });

      // Decode logs
      const decodedLogs = this.decodeLogs(receipt.logs, parsedAbi);

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
        decodedLogs,
      };
    } catch (error: any) {
      throw new TransactionError(
        `Contract write failed: ${error.message}`,
        error
      );
    }
  }

  /**
   * Encode function call data
   */
  encodeFunctionCall(
    functionSignature: string,
    args: any[] = []
  ): string {
    try {
      const abi = parseAbi([functionSignature]);
      const functionName = functionSignature.split('(')[0];
      
      return encodeFunctionData({
        abi: abi as Abi,
        functionName,
        args,
      });
    } catch (error: any) {
      throw new ValidationError(`Function encoding failed: ${error.message}`);
    }
  }

  /**
   * Decode function result
   */
  decodeFunctionCall(
    functionSignature: string,
    data: string
  ): any {
    try {
      const abi = parseAbi([functionSignature]);
      const functionName = functionSignature.split('(')[0];

      return decodeFunctionResult({
        abi: abi as Abi,
        functionName,
        data: data as `0x${string}`,
      });
    } catch (error: any) {
      throw new ValidationError(`Function decoding failed: ${error.message}`);
    }
  }

  /**
   * Query contract events
   */
  async getEvents(
    contractAddress: string,
    filter: EventFilter,
    abi?: Abi | string[]
  ): Promise<DecodedEvent[]> {
    try {
      if (!this.publicClient) {
        throw new ConnectionError('Public client not initialized');
      }

      const contract = this.getContract(contractAddress);
      const contractAbi = abi || contract?.abi;

      if (!contractAbi) {
        throw new ValidationError('Contract ABI not provided or registered');
      }

      const parsedAbi = typeof contractAbi[0] === 'string'
        ? parseAbi(contractAbi as string[])
        : contractAbi as Abi;

      // Get logs
      const logs = await this.publicClient.getLogs({
        address: contractAddress as Address,
        event: this.getEventAbi(parsedAbi, filter.eventName),
        fromBlock: filter.fromBlock,
        toBlock: filter.toBlock,
        args: filter.args,
      });

      // Decode logs
      return logs.map(log => ({
        eventName: filter.eventName,
        args: (log as any).args as Record<string, any>,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        logIndex: log.logIndex || 0,
      }));
    } catch (error: any) {
      throw new TransactionError(`Event query failed: ${error.message}`, error);
    }
  }

  /**
   * Batch read multiple contracts
   */
  async batchRead(
    calls: Array<{
      address: string;
      functionName: string;
      args?: any[];
      abi?: Abi | string[];
    }>
  ): Promise<ContractReadResult[]> {
    const results = await Promise.allSettled(
      calls.map(call =>
        this.read(call.address, call.functionName, call.args || [], call.abi)
      )
    );

    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        success: false,
        error: result.reason?.message || 'Unknown error',
      };
    });
  }

  /**
   * Decode transaction logs
   */
  private decodeLogs(logs: Log[], abi: Abi): any[] {
    return logs
      .map(log => {
        try {
          const decoded = decodeEventLog({
            abi,
            data: log.data,
            topics: log.topics,
          });
          return {
            ...decoded,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }

  /**
   * Get event ABI from full ABI
   */
  private getEventAbi(abi: Abi, eventName: string): any {
    const event = abi.find(
      item => item.type === 'event' && item.name === eventName
    );
    if (!event) {
      throw new ValidationError(`Event ${eventName} not found in ABI`);
    }
    return event;
  }

  /**
   * Validate Ethereum address
   */
  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Ensure wallet is connected
   */
  private ensureConnected(): void {
    if (!this.connection?.connected) {
      throw new ConnectionError('Wallet not connected. Call setConnection() first.');
    }
  }
}
