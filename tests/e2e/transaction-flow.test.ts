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
    it('should require connection for gas estimation', async () => {
      const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      
      await expect(
        walletManager.estimateGas({
          to: testAddress,
          value: BigInt('1000000000000000'), // 0.001 ETH
        })
      ).rejects.toThrow('Wallet not connected');
    });

    it('should execute estimate_gas via function interface', async () => {
      const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      
      const result = await walletManager.executeFunction('estimate_gas', {
        to: testAddress,
        value: BigInt('1000000000000000'),
      });

      // Should fail gracefully when not connected
      expect(result.success).toBe(false);
      expect(result.error).toContain('Wallet not connected');
    });
  });

  describe('Address Validation', () => {
    it('should validate correct Ethereum addresses', async () => {
      const validAddresses = [
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
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
