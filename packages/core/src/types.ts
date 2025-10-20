/**
 * Core type definitions for Web3 LLM integration
 */

export interface Chain {
  id: number;
  name: string;
  network: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: { http: string[] };
    public: { http: string[] };
  };
  blockExplorers?: {
    default: { name: string; url: string };
  };
  testnet?: boolean;
}

export interface WalletConfig {
  chains: Chain[];
  defaultChain: Chain;
  rpcTimeout?: number;
  confirmations?: number;
}

export type WalletProvider = 'metamask' | 'walletconnect' | 'coinbase' | 'injected';

export interface WalletConnection {
  address: string;
  chainId: number;
  provider: WalletProvider;
  connected: boolean;
}

export interface TransactionRequest {
  to: string;
  value?: bigint;
  data?: `0x${string}`;
  gasLimit?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: bigint;
  blockHash: string;
  from: string;
  to: string | null;
  contractAddress: string | null;
  status: 'success' | 'reverted';
  gasUsed: bigint;
  effectiveGasPrice: bigint;
}

export interface Balance {
  value: bigint;
  formatted: string;
  symbol: string;
  decimals: number;
}

export interface TokenBalance extends Balance {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
}

export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedCost: bigint;
  estimatedCostFormatted: string;
}

export interface FunctionCallResult {
  success: boolean;
  data?: any;
  error?: string;
  transactionHash?: string;
  receipt?: TransactionReceipt;
}

export interface Web3Function {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (params: any) => Promise<FunctionCallResult>;
  requiresApproval: boolean;
}

export interface WalletManagerOptions extends WalletConfig {
  autoConnect?: boolean;
  cacheConnection?: boolean;
}

export class Web3Error extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'Web3Error';
  }
}

export class TransactionError extends Web3Error {
  constructor(message: string, details?: any) {
    super(message, 'TRANSACTION_ERROR', details);
    this.name = 'TransactionError';
  }
}

export class ConnectionError extends Web3Error {
  constructor(message: string, details?: any) {
    super(message, 'CONNECTION_ERROR', details);
    this.name = 'ConnectionError';
  }
}

export class ValidationError extends Web3Error {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}
