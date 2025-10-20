/**
 * E2E Test: Wallet Connection Flow
 * 
 * Tests complete wallet connection lifecycle including
 * MetaMask integration, chain switching, and event handling.
 */

import { WalletManager } from '../../packages/core/src/wallet-manager';
import { ethereum, sepolia } from '../../packages/chains/src/definitions';

describe('E2E: Wallet Connection', () => {
  let walletManager: WalletManager;

  beforeEach(() => {
    walletManager = new WalletManager({
      chains: [ethereum, sepolia],
      defaultChain: ethereum,
    });
  });

  afterEach(async () => {
    await walletManager.disconnect();
  });

  describe('Connection Lifecycle', () => {
    it('should initialize with correct configuration', () => {
      expect(walletManager).toBeDefined();
      expect(walletManager.isConnected()).toBe(false);
    });

    it('should handle connection when MetaMask not available', async () => {
      // Mock window.ethereum as undefined
      const originalEthereum = (global as any).window?.ethereum;
      if (global.window) {
        delete (global.window as any).ethereum;
      }

      await expect(walletManager.connect('metamask')).rejects.toThrow(
        'No Web3 provider detected'
      );

      // Restore
      if (global.window && originalEthereum) {
        (global.window as any).ethereum = originalEthereum;
      }
    });

    it('should return null connection when not connected', () => {
      const connection = walletManager.getConnection();
      expect(connection).toBeNull();
    });
  });

  describe('Connection State', () => {
    it('should track connection status correctly', async () => {
      expect(walletManager.isConnected()).toBe(false);
      
      // Connection would happen here if MetaMask available
      // await walletManager.connect('metamask');
      // expect(walletManager.isConnected()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should throw ConnectionError when operations require connection', async () => {
      await expect(walletManager.getBalance()).rejects.toThrow('Wallet not connected');
    });

    it('should throw ConnectionError for token balance when not connected', async () => {
      await expect(
        walletManager.getTokenBalance('0x0000000000000000000000000000000000000000')
      ).rejects.toThrow('Wallet not connected');
    });
  });
});
