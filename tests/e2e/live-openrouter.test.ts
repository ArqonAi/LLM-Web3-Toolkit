/**
 * E2E Test: Live OpenRouter Integration
 * 
 * Tests actual OpenRouter API calls with Web3 function calling.
 * Requires OPENROUTER_API_KEY environment variable.
 * 
 * Run with: OPENROUTER_API_KEY=your_key npm test -- live-openrouter
 */

import { WalletManager } from '../../packages/core/src/wallet-manager';
import { sepolia } from '../../packages/chains/src/definitions';
import { openAIFunctions } from '../../packages/functions/src/openai';

describe('E2E: Live OpenRouter Integration', () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  let walletManager: WalletManager;

  beforeAll(() => {
    if (!apiKey) {
      console.warn('Skipping live tests - OPENROUTER_API_KEY not set');
    }

    walletManager = new WalletManager({
      chains: [sepolia],
      defaultChain: sepolia,
    });
  });

  describe('Function Calling with OpenRouter', () => {
    it('should call OpenRouter API and receive function call for address validation', async () => {
      if (!apiKey) {
        console.log('Skipping - no API key');
        return;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/ArqonAi/LLM-Web3-Toolkit',
          'X-Title': 'LLM-Web3-Toolkit E2E Test',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a Web3 assistant with access to blockchain functions.',
            },
            {
              role: 'user',
              content: 'Validate this Ethereum address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            },
          ],
          functions: openAIFunctions,
          function_call: 'auto',
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.choices).toBeDefined();
      expect(data.choices.length).toBeGreaterThan(0);

      const message = data.choices[0].message;
      console.log('OpenRouter response:', JSON.stringify(message, null, 2));

      if (message.function_call) {
        expect(message.function_call.name).toBe('validate_address');
        
        const args = JSON.parse(message.function_call.arguments);
        expect(args.address).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');

        const result = await walletManager.executeFunction(
          message.function_call.name,
          args
        );

        expect(result.success).toBe(true);
        expect(result.data.valid).toBe(true);
      }
    }, 30000);

    it('should handle balance query through OpenRouter', async () => {
      if (!apiKey) {
        console.log('Skipping - no API key');
        return;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/ArqonAi/LLM-Web3-Toolkit',
          'X-Title': 'LLM-Web3-Toolkit E2E Test',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a Web3 assistant. When users ask about balances, use the get_balance function.',
            },
            {
              role: 'user',
              content: 'What is the balance of 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?',
            },
          ],
          functions: openAIFunctions,
          function_call: 'auto',
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      const message = data.choices[0].message;
      console.log('Balance query response:', JSON.stringify(message, null, 2));

      if (message.function_call) {
        expect(['get_balance', 'validate_address']).toContain(message.function_call.name);
      }
    }, 30000);

    it('should handle gas estimation request', async () => {
      if (!apiKey) {
        console.log('Skipping - no API key');
        return;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/ArqonAi/LLM-Web3-Toolkit',
          'X-Title': 'LLM-Web3-Toolkit E2E Test',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a Web3 assistant. Use functions to help users with blockchain operations.',
            },
            {
              role: 'user',
              content: 'Estimate gas for sending 0.01 ETH to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            },
          ],
          functions: openAIFunctions,
          function_call: 'auto',
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      const message = data.choices[0].message;
      console.log('Gas estimation response:', JSON.stringify(message, null, 2));

      if (message.function_call) {
        console.log('Function called:', message.function_call.name);
        console.log('Arguments:', message.function_call.arguments);
      }
    }, 30000);
  });

  describe('Multi-turn Conversation', () => {
    it('should handle multi-turn conversation with function calls', async () => {
      if (!apiKey) {
        console.log('Skipping - no API key');
        return;
      }

      const conversationHistory: any[] = [
        {
          role: 'system',
          content: 'You are a Web3 assistant with blockchain function access.',
        },
        {
          role: 'user',
          content: 'I have address 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb. Can you validate it first?',
        },
      ];

      const firstResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/ArqonAi/LLM-Web3-Toolkit',
          'X-Title': 'LLM-Web3-Toolkit E2E Test',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: conversationHistory,
          functions: openAIFunctions,
          function_call: 'auto',
        }),
      });

      const firstData = await firstResponse.json();
      const firstMessage = firstData.choices[0].message;

      console.log('First turn:', JSON.stringify(firstMessage, null, 2));

      if (firstMessage.function_call) {
        conversationHistory.push(firstMessage);

        const result = await walletManager.executeFunction(
          firstMessage.function_call.name,
          JSON.parse(firstMessage.function_call.arguments)
        );

        conversationHistory.push({
          role: 'function',
          name: firstMessage.function_call.name,
          content: JSON.stringify(result),
        });

        conversationHistory.push({
          role: 'user',
          content: 'Great! Now check its balance.',
        });

        const secondResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/ArqonAi/LLM-Web3-Toolkit',
            'X-Title': 'LLM-Web3-Toolkit E2E Test',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: conversationHistory,
            functions: openAIFunctions,
            function_call: 'auto',
          }),
        });

        const secondData = await secondResponse.json();
        const secondMessage = secondData.choices[0].message;

        console.log('Second turn:', JSON.stringify(secondMessage, null, 2));

        expect(secondResponse.ok).toBe(true);
      }
    }, 60000);
  });
});
