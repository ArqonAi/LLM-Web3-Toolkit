/**
 * GasOptimizer - EIP-1559 Gas Optimization
 */

import type { PublicClient } from 'viem';
import { Chain } from './types';

export interface GasEstimate {
  baseFee: bigint;
  maxPriorityFeePerGas: bigint;
  maxFeePerGas: bigint;
  estimatedCost: bigint;
  strategy: 'slow' | 'standard' | 'fast';
}

export class GasOptimizer {
  private publicClient: PublicClient;

  constructor(publicClient: PublicClient, _chain: Chain) {
    this.publicClient = publicClient;
  }

  async getGasPrices(gasLimit: bigint = BigInt(21000)): Promise<{
    slow: GasEstimate;
    standard: GasEstimate;
    fast: GasEstimate;
  }> {
    const block = await this.publicClient.getBlock({ blockTag: 'latest' });
    const baseFee = block.baseFeePerGas || BigInt(0);

    const fees = {
      slow: BigInt(1e9),
      standard: BigInt(2e9),
      fast: BigInt(3e9),
    };

    return {
      slow: this.createEstimate(baseFee, fees.slow, gasLimit, 'slow'),
      standard: this.createEstimate(baseFee, fees.standard, gasLimit, 'standard'),
      fast: this.createEstimate(baseFee, fees.fast, gasLimit, 'fast'),
    };
  }

  private createEstimate(
    baseFee: bigint,
    priorityFee: bigint,
    gasLimit: bigint,
    strategy: 'slow' | 'standard' | 'fast'
  ): GasEstimate {
    const maxFeePerGas = baseFee * BigInt(2) + priorityFee;
    return {
      baseFee,
      maxPriorityFeePerGas: priorityFee,
      maxFeePerGas,
      estimatedCost: maxFeePerGas * gasLimit,
      strategy,
    };
  }
}
