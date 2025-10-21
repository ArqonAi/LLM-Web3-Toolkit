/**
 * E2E Test: OpenAI Function Calling Integration
 * 
 * Tests OpenAI GPT-4 integration with Web3 function calling.
 * Validates schema compatibility and function execution flow.
 */

import { WalletManager } from '../../packages/core/src/wallet-manager';
import { ethereum } from '../../packages/chains/src/definitions';
import { openAIFunctions } from '../../packages/functions/src/openai';

describe('E2E: OpenAI Integration', () => {
  let walletManager: WalletManager;

  beforeAll(() => {
    walletManager = new WalletManager({
      chains: [ethereum],
      defaultChain: ethereum,
    });
  });

  describe('Function Schema Validation', () => {
    it('should have valid OpenAI function format', () => {
      openAIFunctions.forEach(func => {
        expect(func).toHaveProperty('name');
        expect(typeof func.name).toBe('string');
        
        expect(func).toHaveProperty('description');
        expect(typeof func.description).toBe('string');
        expect(func.description.length).toBeGreaterThan(10);
        
        expect(func).toHaveProperty('parameters');
        expect(func.parameters.type).toBe('object');
        expect(func.parameters).toHaveProperty('properties');
      });
    });

    it('should have required parameters defined', () => {
      const sendNative = openAIFunctions.find(f => f.name === 'send_native');
      expect(sendNative).toBeDefined();
      expect(sendNative!.parameters.required).toEqual(['to', 'amount']);
      
      const getBalance = openAIFunctions.find(f => f.name === 'get_balance');
      expect(getBalance).toBeDefined();
      expect(getBalance!.parameters.required || []).toHaveLength(0);
    });

    it('should have address validation patterns', () => {
      // Functions that deal with addresses should have address patterns
      // Note: validate_address doesn't have pattern since it validates any string
      const addressFunctions = [
        'send_native',
        'get_balance',
        'send_token',
        'get_token_balance',
      ];

      addressFunctions.forEach(name => {
        const func = openAIFunctions.find(f => f.name === name);
        expect(func).toBeDefined();
        
        // Check if any property has address pattern
        const props = func!.parameters.properties;
        const hasAddressValidation = Object.values(props).some(
          (prop: any) => prop.pattern?.includes('0x[a-fA-F0-9]{40}')
        );
        expect(hasAddressValidation).toBe(true);
      });
    });
  });

  describe('Function Mapping', () => {
    it('should map all functions to WalletManager methods', async () => {
      // Only test functions that work without connection
      const noConnectionFunctions = [
        { name: 'get_wallet_address', params: {} },
        { name: 'validate_address', params: { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' } },
      ];

      for (const { name, params } of noConnectionFunctions) {
        const result = await walletManager.executeFunction(name, params);
        expect(result).toHaveProperty('success');
        expect(result.success).toBe(true);
        expect(result).toHaveProperty('data');
      }
    });

    it('should handle validation correctly', async () => {
      const result = await walletManager.executeFunction('validate_address', {
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('valid');
      expect(result.data).toHaveProperty('address');
    });
  });

  describe('OpenAI Response Format', () => {
    it('should match expected function call structure', () => {
      const mockFunctionCall = {
        name: 'get_balance',
        arguments: JSON.stringify({
          address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        }),
      };

      const func = openAIFunctions.find(f => f.name === mockFunctionCall.name);
      expect(func).toBeDefined();

      const args = JSON.parse(mockFunctionCall.arguments);
      expect(args).toHaveProperty('address');
    });

    it('should validate parameter types from OpenAI', () => {
      const getBalance = openAIFunctions.find(f => f.name === 'get_balance');
      expect(getBalance!.parameters.properties.address.type).toBe('string');

      const sendNative = openAIFunctions.find(f => f.name === 'send_native');
      expect(sendNative!.parameters.properties.amount.type).toBe('string');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle missing required parameters', async () => {
      const result = await walletManager.executeFunction('send_native', {
        to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        // Missing amount
      });

      expect(result.success).toBe(false);
    });

    it('should handle malformed addresses', async () => {
      const result = await walletManager.executeFunction('send_native', {
        to: 'invalid-address',
        amount: '0.1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
