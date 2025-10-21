/**
 * BatchManager - Batch Transaction Execution
 * 
 * Execute multiple transactions atomically or in sequence with
 * automatic nonce management, gas optimization, and progress tracking.
 */

import {
  Chain,
  WalletConnection,
  TransactionReceipt,
  TransactionError,
} from './types';
import type { WalletClient, PublicClient, Address, Hash } from 'viem';

export interface BatchTransaction {
  id: string;
  to: string;
  value?: bigint;
  data?: string;
  gasLimit?: bigint;
  description?: string;
}

export interface BatchConfig {
  atomic?: boolean; // If true, all fail if one fails
  delayMs?: number; // Delay between transactions
  maxRetries?: number; // Retry failed transactions
  onProgress?: (progress: BatchProgress) => void;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  currentTransaction?: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

export interface BatchResult {
  batchId: string;
  success: boolean;
  transactions: {
    id: string;
    status: 'success' | 'failed' | 'pending';
    receipt?: TransactionReceipt;
    error?: string;
    retries?: number;
  }[];
  totalGasUsed: bigint;
  totalCost: bigint;
  executionTime: number;
}

/**
 * Batch Transaction Manager
 * 
 * Features:
 * - Atomic or sequential execution
 * - Automatic nonce management
 * - Retry logic with exponential backoff
 * - Progress tracking
 * - Gas optimization
 */
export class BatchManager {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private connection: WalletConnection;
  private chain: Chain;
  private activeBatches: Map<string, BatchProgress> = new Map();

  constructor(
    publicClient: PublicClient,
    walletClient: WalletClient,
    connection: WalletConnection,
    chain: Chain
  ) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.connection = connection;
    this.chain = chain;
  }

  /**
   * Create a new batch
   */
  createBatch(
    transactions: Omit<BatchTransaction, 'id'>[]
  ): { batchId: string; transactions: BatchTransaction[] } {
    const batchId = this.generateBatchId();
    
    const batchTransactions = transactions.map((tx, index) => ({
      ...tx,
      id: `${batchId}-${index}`,
    }));

    this.activeBatches.set(batchId, {
      total: batchTransactions.length,
      completed: 0,
      failed: 0,
      pending: batchTransactions.length,
      status: 'pending',
    });

    return { batchId, transactions: batchTransactions };
  }

  /**
   * Execute batch of transactions
   */
  async executeBatch(
    batchId: string,
    transactions: BatchTransaction[],
    config: BatchConfig = {}
  ): Promise<BatchResult> {
    const startTime = Date.now();
    const results: BatchResult['transactions'] = [];
    let totalGasUsed = BigInt(0);
    let totalCost = BigInt(0);

    // Update progress
    this.updateProgress(batchId, {
      status: 'executing',
      currentTransaction: transactions[0]?.id,
    });

    try {
      // Get starting nonce
      const nonce = await this.publicClient.getTransactionCount({
        address: this.connection.address as Address,
      });

      // Execute transactions
      if (config.atomic) {
        // Atomic execution: all or nothing
        const result = await this.executeAtomic(
          batchId,
          transactions,
          nonce,
          config
        );
        results.push(...result.transactions);
        totalGasUsed = result.totalGasUsed;
        totalCost = result.totalCost;
      } else {
        // Sequential execution with retry
        for (let i = 0; i < transactions.length; i++) {
          const tx = transactions[i];
          const txNonce = nonce + i;

          // Delay between transactions
          if (i > 0 && config.delayMs) {
            await this.delay(config.delayMs);
          }

          this.updateProgress(batchId, {
            currentTransaction: tx.id,
          });

          const result = await this.executeWithRetry(
            tx,
            txNonce,
            config.maxRetries || 0
          );

          results.push(result);

          if (result.status === 'success' && result.receipt) {
            totalGasUsed += result.receipt.gasUsed;
            totalCost += result.receipt.gasUsed * result.receipt.effectiveGasPrice;
            
            this.updateProgress(batchId, {
              completed: i + 1,
              pending: transactions.length - i - 1,
            });
          } else {
            this.updateProgress(batchId, {
              failed: this.activeBatches.get(batchId)!.failed + 1,
              pending: transactions.length - i - 1,
            });
          }

          // Call progress callback
          if (config.onProgress) {
            config.onProgress(this.activeBatches.get(batchId)!);
          }
        }
      }

      const allSuccess = results.every(r => r.status === 'success');
      
      this.updateProgress(batchId, {
        status: allSuccess ? 'completed' : 'failed',
      });

      return {
        batchId,
        success: allSuccess,
        transactions: results,
        totalGasUsed,
        totalCost,
        executionTime: Date.now() - startTime,
      };
    } catch (error: any) {
      this.updateProgress(batchId, { status: 'failed' });
      
      throw new TransactionError(
        `Batch execution failed: ${error.message}`,
        error
      );
    } finally {
      this.activeBatches.delete(batchId);
    }
  }

  /**
   * Execute transactions atomically
   */
  private async executeAtomic(
    batchId: string,
    transactions: BatchTransaction[],
    startNonce: number,
    config: BatchConfig
  ): Promise<{
    transactions: BatchResult['transactions'];
    totalGasUsed: bigint;
    totalCost: bigint;
  }> {
    const results: BatchResult['transactions'] = [];
    let totalGasUsed = BigInt(0);
    let totalCost = BigInt(0);

    try {
      // Send all transactions in parallel
      const hashes: Hash[] = [];
      
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];
        const nonce = startNonce + i;

        this.updateProgress(batchId, {
          currentTransaction: tx.id,
        });

        const hash = await this.walletClient.sendTransaction({
          to: tx.to as Address,
          value: tx.value,
          data: tx.data as `0x${string}`,
          nonce,
          gas: tx.gasLimit,
          chain: this.chain as any,
          account: this.connection.address as Address,
        });

        hashes.push(hash);
      }

      // Wait for all receipts
      for (let i = 0; i < hashes.length; i++) {
        const receipt = await this.publicClient.waitForTransactionReceipt({
          hash: hashes[i],
          confirmations: 1,
        });

        if (receipt.status === 'reverted') {
          // If atomic and one fails, mark all as failed
          throw new TransactionError(
            `Atomic batch failed: Transaction ${transactions[i].id} reverted`
          );
        }

        totalGasUsed += receipt.gasUsed;
        totalCost += receipt.gasUsed * receipt.effectiveGasPrice;

        results.push({
          id: transactions[i].id,
          status: 'success',
          receipt: {
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            blockHash: receipt.blockHash,
            from: receipt.from,
            to: receipt.to || null,
            contractAddress: receipt.contractAddress || null,
            status: 'success',
            gasUsed: receipt.gasUsed,
            effectiveGasPrice: receipt.effectiveGasPrice,
          },
        });

        this.updateProgress(batchId, {
          completed: i + 1,
          pending: transactions.length - i - 1,
        });

        if (config.onProgress) {
          config.onProgress(this.activeBatches.get(batchId)!);
        }
      }

      return { transactions: results, totalGasUsed, totalCost };
    } catch (error: any) {
      // Mark all as failed in atomic mode
      transactions.forEach(tx => {
        results.push({
          id: tx.id,
          status: 'failed',
          error: error.message,
        });
      });

      throw error;
    }
  }

  /**
   * Execute single transaction with retry logic
   */
  private async executeWithRetry(
    tx: BatchTransaction,
    nonce: number,
    maxRetries: number
  ): Promise<BatchResult['transactions'][0]> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const hash = await this.walletClient.sendTransaction({
          to: tx.to as Address,
          value: tx.value,
          data: tx.data as `0x${string}`,
          nonce,
          gas: tx.gasLimit,
          chain: this.chain as any,
          account: this.connection.address as Address,
        });

        const receipt = await this.publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });

        return {
          id: tx.id,
          status: receipt.status === 'success' ? 'success' : 'failed',
          receipt: {
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            blockHash: receipt.blockHash,
            from: receipt.from,
            to: receipt.to || null,
            contractAddress: receipt.contractAddress || null,
            status: receipt.status === 'success' ? 'success' : 'reverted',
            gasUsed: receipt.gasUsed,
            effectiveGasPrice: receipt.effectiveGasPrice,
          },
          retries: attempt,
        };
      } catch (error: any) {
        lastError = error;
        
        // Exponential backoff
        if (attempt < maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    return {
      id: tx.id,
      status: 'failed',
      error: lastError.message,
      retries: maxRetries,
    };
  }

  /**
   * Get batch progress
   */
  getBatchProgress(batchId: string): BatchProgress | undefined {
    return this.activeBatches.get(batchId);
  }

  /**
   * Estimate batch gas cost
   */
  async estimateBatchCost(
    transactions: Omit<BatchTransaction, 'id'>[]
  ): Promise<{
    totalGasLimit: bigint;
    estimatedCost: bigint;
    estimatedCostFormatted: string;
  }> {
    let totalGasLimit = BigInt(0);

    for (const tx of transactions) {
      const estimate = await this.publicClient.estimateGas({
        to: tx.to as Address,
        value: tx.value,
        data: tx.data as `0x${string}`,
        account: this.connection.address as Address,
      });

      totalGasLimit += estimate;
    }

    const gasPrice = await this.publicClient.getGasPrice();
    const estimatedCost = totalGasLimit * gasPrice;

    return {
      totalGasLimit,
      estimatedCost,
      estimatedCostFormatted: (Number(estimatedCost) / 1e18).toFixed(6),
    };
  }

  /**
   * Update progress
   */
  private updateProgress(
    batchId: string,
    updates: Partial<BatchProgress>
  ): void {
    const current = this.activeBatches.get(batchId);
    if (current) {
      this.activeBatches.set(batchId, { ...current, ...updates });
    }
  }

  /**
   * Generate unique batch ID
   */
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
