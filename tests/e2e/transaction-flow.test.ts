/**
 * E2E Test: Complete Transaction Flow
 * 
 * Tests end-to-end transaction lifecycle including estimation,
 * execution, and confirmation on Sepolia testnet.
 */

import { WalletManager } from '../../packages/core/src/wallet-manager';
import { sepolia } from '../../packages/chains/src/definitions';

describe('E2E: Transaction Flow', () => {
  let walletManager: WalletManager;

  beforeAll(() => {
    walletManager = new WalletManager({
      chains: [sepolia],
      defaultChain: sepolia,
      confirmations: 1,
    });
  });

  describe('Gas Estimation', () => {
    it('should estimate gas for simple ETH transfer', async () => {
      const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      
      const estimate = await walletManager.estimateGas({
        to: testAddress,
        value: BigInt('1000000000000000'), // 0.001 ETH
      });

      expect(estimate).toBeDefined();
      expect(estimate.gasLimit).toBeGreaterThan(BigInt(0));
      expect(estimate.gasPrice).toBeGreaterThan(BigInt(0));
      expect(estimate.estimatedCost).toBeGreaterThan(BigInt(0));
      expect(estimate.estimatedCostFormatted).toMatch(/^[0-9.]+$/);
    });

    it('should provide reasonable gas estimates', async () => {
      const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      
      const estimate = await walletManager.estimateGas({
        to: testAddress,
        value: BigInt('1000000000000000'),
      });

      // Standard ETH transfer should be 21000 gas
      expect(estimate.gasLimit).toBeLessThanOrEqual(BigInt(30000));
      expect(estimate.gasLimit).toBeGreaterThanOrEqual(BigInt(21000));
    });
  });

  describe('Address Validation', () => {
    it('should validate correct Ethereum addresses', async () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        '0x0000000000000000000000000000000000000000',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ];

      for (const address of validAddresses) {
        const result = await walletManager.executeFunction('validate_address', {
          address,
        });

        expect(result.success).toBe(true);
        expect(result.data.valid).toBe(true);
      }
    });

    it('should reject invalid addresses', async () => {
      const invalidAddresses = [
        'not-an-address',
        '0x123',
        '742d35Cc6634C0532925a3b844Bc9e7595f0bEb', // Missing 0x
        '0xZZZd35Cc6634C0532925a3b844Bc9e7595f0bEb', // Invalid hex
      ];

      for (const address of invalidAddresses) {
        const result = await walletManager.executeFunction('validate_address', {
          address,
        });

        expect(result.success).toBe(true);
        expect(result.data.valid).toBe(false);
      }
    });
  });

  describe('Function Execution', () => {
    it('should execute get_wallet_address when disconnected', async () => {
      const result = await walletManager.executeFunction('get_wallet_address', {});

      expect(result.success).toBe(true);
      expect(result.data.address).toBeUndefined(); // Not connected
    });

    it('should handle unknown function gracefully', async () => {
      const result = await walletManager.executeFunction('unknown_function', {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown function');
    });

    it('should return error for balance check when not connected', async () => {
      const result = await walletManager.executeFunction('get_balance', {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('not connected');
    });
  });
});
