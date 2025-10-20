/**
 * E2E Test: Multi-Chain Operations
 * 
 * Tests chain switching, multi-chain configuration,
 * and cross-chain functionality.
 */

import { WalletManager } from '../../packages/core/src/wallet-manager';
import {
  ethereum,
  arbitrum,
  optimism,
  base,
  polygon,
  allChains,
  mainnetChains,
  testnetChains,
  getChainById,
  getChainByName,
} from '../../packages/chains/src/definitions';

describe('E2E: Multi-Chain Operations', () => {
  describe('Chain Definitions', () => {
    it('should have all major chains defined', () => {
      expect(allChains.length).toBeGreaterThanOrEqual(8);
      
      const chainNames = allChains.map(c => c.name);
      expect(chainNames).toContain('Ethereum');
      expect(chainNames).toContain('Arbitrum One');
      expect(chainNames).toContain('Optimism');
      expect(chainNames).toContain('Base');
      expect(chainNames).toContain('Polygon');
    });

    it('should separate mainnet and testnet chains', () => {
      expect(mainnetChains.length).toBeGreaterThan(0);
      expect(testnetChains.length).toBeGreaterThan(0);
      
      mainnetChains.forEach(chain => {
        expect(chain.testnet).toBeFalsy();
      });

      testnetChains.forEach(chain => {
        expect(chain.testnet).toBe(true);
      });
    });

    it('should have valid chain IDs', () => {
      const expectedChainIds = [1, 42161, 10, 8453, 137, 43114, 56, 11155111];
      
      expectedChainIds.forEach(id => {
        const chain = getChainById(id);
        expect(chain).toBeDefined();
        expect(chain!.id).toBe(id);
      });
    });

    it('should have valid RPC URLs', () => {
      allChains.forEach(chain => {
        expect(chain.rpcUrls.default.http).toBeDefined();
        expect(chain.rpcUrls.default.http.length).toBeGreaterThan(0);
        expect(chain.rpcUrls.default.http[0]).toMatch(/^https?:\/\//);
      });
    });

    it('should have block explorers', () => {
      mainnetChains.forEach(chain => {
        expect(chain.blockExplorers).toBeDefined();
        expect(chain.blockExplorers!.default.url).toMatch(/^https?:\/\//);
      });
    });
  });

  describe('Chain Utilities', () => {
    it('should find chains by ID', () => {
      const eth = getChainById(1);
      expect(eth).toBeDefined();
      expect(eth!.name).toBe('Ethereum');

      const arb = getChainById(42161);
      expect(arb).toBeDefined();
      expect(arb!.name).toBe('Arbitrum One');
    });

    it('should find chains by name', () => {
      const eth = getChainByName('Ethereum');
      expect(eth).toBeDefined();
      expect(eth!.id).toBe(1);

      const optimism = getChainByName('optimism');
      expect(optimism).toBeDefined();
      expect(optimism!.id).toBe(10);
    });

    it('should return undefined for invalid chains', () => {
      const invalid = getChainById(999999);
      expect(invalid).toBeUndefined();

      const invalidName = getChainByName('NonexistentChain');
      expect(invalidName).toBeUndefined();
    });
  });

  describe('WalletManager Multi-Chain', () => {
    it('should initialize with multiple chains', () => {
      const manager = new WalletManager({
        chains: [ethereum, arbitrum, optimism],
        defaultChain: ethereum,
      });

      expect(manager).toBeDefined();
      expect(manager.isConnected()).toBe(false);
    });

    it('should initialize with all chains', () => {
      const manager = new WalletManager({
        chains: allChains,
        defaultChain: ethereum,
      });

      expect(manager).toBeDefined();
    });

    it('should handle chain switching validation', async () => {
      const manager = new WalletManager({
        chains: [ethereum, arbitrum],
        defaultChain: ethereum,
      });

      // Should fail for unconfigured chain
      await expect(
        manager.switchChain(999999)
      ).rejects.toThrow('not configured');
    });
  });

  describe('Chain-Specific Configuration', () => {
    it('should have correct native currencies', () => {
      expect(ethereum.nativeCurrency.symbol).toBe('ETH');
      expect(polygon.nativeCurrency.symbol).toBe('POL');
      expect(allChains[6].nativeCurrency.symbol).toBe('BNB'); // BSC
    });

    it('should have correct chain networks', () => {
      expect(ethereum.network).toBe('mainnet');
      expect(arbitrum.network).toBe('arbitrum');
      expect(optimism.network).toBe('optimism');
    });

    it('should have 18 decimals for major chains', () => {
      [ethereum, arbitrum, optimism, base, polygon].forEach(chain => {
        expect(chain.nativeCurrency.decimals).toBe(18);
      });
    });
  });

  describe('Layer 2 Chains', () => {
    it('should identify L2 chains', () => {
      const l2Chains = [arbitrum, optimism, base];
      const l2ChainIds = [42161, 10, 8453];

      l2Chains.forEach((chain, index) => {
        expect(chain.id).toBe(l2ChainIds[index]);
        expect(chain.nativeCurrency.symbol).toBe('ETH');
      });
    });

    it('should have appropriate block explorers for L2s', () => {
      expect(arbitrum.blockExplorers!.default.name).toBe('Arbiscan');
      expect(optimism.blockExplorers!.default.name).toBe('Optimistic Etherscan');
      expect(base.blockExplorers!.default.name).toBe('BaseScan');
    });
  });

  describe('Function Execution Across Chains', () => {
    it('should validate addresses regardless of chain', async () => {
      const chains = [ethereum, arbitrum, polygon];

      for (const chain of chains) {
        const manager = new WalletManager({
          chains: [chain],
          defaultChain: chain,
        });

        const result = await manager.executeFunction('validate_address', {
          address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        });

        expect(result.success).toBe(true);
        expect(result.data.valid).toBe(true);
      }
    });
  });
});
