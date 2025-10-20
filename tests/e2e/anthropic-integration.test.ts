/**
 * E2E Test: Anthropic Claude Tool Integration
 * 
 * Tests Anthropic Claude tool use with Web3 operations.
 * Validates tool schema compatibility and execution flow.
 */

import { WalletManager } from '../../packages/core/src/wallet-manager';
import { ethereum } from '../../packages/chains/src/definitions';
import { anthropicTools, readOnlyTools, writeTools } from '../../packages/functions/src/anthropic';

describe('E2E: Anthropic Integration', () => {
  let walletManager: WalletManager;

  beforeAll(() => {
    walletManager = new WalletManager({
      chains: [ethereum],
      defaultChain: ethereum,
    });
  });

  describe('Tool Schema Validation', () => {
    it('should have valid Anthropic tool format', () => {
      anthropicTools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(typeof tool.name).toBe('string');
        
        expect(tool).toHaveProperty('description');
        expect(typeof tool.description).toBe('string');
        expect(tool.description.length).toBeGreaterThan(10);
        
        expect(tool).toHaveProperty('input_schema');
        expect(tool.input_schema.type).toBe('object');
        expect(tool.input_schema).toHaveProperty('properties');
      });
    });

    it('should categorize tools correctly', () => {
      expect(readOnlyTools.length).toBeGreaterThan(0);
      expect(writeTools.length).toBeGreaterThan(0);
      expect(readOnlyTools.length + writeTools.length).toBeLessThanOrEqual(anthropicTools.length);
    });

    it('should have comprehensive descriptions', () => {
      const sendNative = anthropicTools.find(t => t.name === 'send_native');
      expect(sendNative).toBeDefined();
      expect(sendNative!.description).toContain('user approval');
      
      const getBalance = anthropicTools.find(t => t.name === 'get_balance');
      expect(getBalance).toBeDefined();
      expect(getBalance!.description.length).toBeGreaterThan(50);
    });
  });

  describe('Tool Use Format', () => {
    it('should match Claude tool use structure', () => {
      const mockToolUse = {
        type: 'tool_use',
        id: 'toolu_123',
        name: 'get_balance',
        input: {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        },
      };

      const tool = anthropicTools.find(t => t.name === mockToolUse.name);
      expect(tool).toBeDefined();

      const inputProps = tool!.input_schema.properties;
      expect(inputProps).toHaveProperty('address');
    });

    it('should validate required fields', () => {
      const sendToken = anthropicTools.find(t => t.name === 'send_token');
      expect(sendToken).toBeDefined();
      expect(sendToken!.input_schema.required).toContain('tokenAddress');
      expect(sendToken!.input_schema.required).toContain('to');
      expect(sendToken!.input_schema.required).toContain('amount');
    });
  });

  describe('Tool Execution', () => {
    it('should execute read-only tools without connection', async () => {
      const result = await walletManager.executeFunction('validate_address', {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      });

      expect(result.success).toBe(true);
      expect(result.data.valid).toBe(true);
    });

    it('should return appropriate errors for write operations', async () => {
      const result = await walletManager.executeFunction('send_native', {
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        amount: '0.1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not connected');
    });
  });

  describe('Parameter Types', () => {
    it('should have correct input types', () => {
      const switchChain = anthropicTools.find(t => t.name === 'switch_chain');
      expect(switchChain).toBeDefined();
      expect(switchChain!.input_schema.properties.chainId.type).toBe('number');

      const sendNative = anthropicTools.find(t => t.name === 'send_native');
      expect(sendNative!.input_schema.properties.amount.type).toBe('string');
    });

    it('should provide helpful descriptions', () => {
      const estimateGas = anthropicTools.find(t => t.name === 'estimate_gas');
      expect(estimateGas).toBeDefined();
      expect(estimateGas!.description).toContain('gas');
      expect(estimateGas!.description).toContain('estimate');
    });
  });

  describe('Tool Result Format', () => {
    it('should format results for Claude tool use', async () => {
      const result = await walletManager.executeFunction('validate_address', {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      });

      // Result should be serializable for Claude
      const serialized = JSON.stringify(result);
      const parsed = JSON.parse(serialized);
      
      expect(parsed).toHaveProperty('success');
      expect(parsed).toHaveProperty('data');
    });

    it('should handle errors gracefully', async () => {
      const result = await walletManager.executeFunction('unknown_tool', {});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });
  });

  describe('Chain-Specific Tools', () => {
    it('should have chain switching capability', () => {
      const switchChain = anthropicTools.find(t => t.name === 'switch_chain');
      expect(switchChain).toBeDefined();
      expect(switchChain!.description).toContain('chain');
      expect(switchChain!.description).toMatch(/\b(1|42161|10|8453|137)\b/); // Chain IDs mentioned
    });

    it('should provide gas price information', () => {
      const getGasPrice = anthropicTools.find(t => t.name === 'get_gas_price');
      expect(getGasPrice).toBeDefined();
      expect(getGasPrice!.description).toContain('gas price');
    });
  });
});
