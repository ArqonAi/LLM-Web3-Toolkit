/**
 * E2E Test: Live API Integration with OpenRouter
 * 
 * Tests actual API calls with OpenRouter using tools format.
 * Run: OPENROUTER_API_KEY=xxx npm test -- live-api
 */

import { WalletManager } from '../../packages/core/src/wallet-manager';
import { sepolia } from '../../packages/chains/src/definitions';

const API_KEY = process.env.OPENROUTER_API_KEY;

// OpenAI tools format (for OpenRouter)
const validateAddressTool = {
  type: 'function',
  function: {
    name: 'validate_address',
    description: 'Validate if a string is a properly formatted Ethereum address',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The Ethereum address to validate',
        },
      },
      required: ['address'],
    },
  },
};

const getBalanceTool = {
  type: 'function',
  function: {
    name: 'get_balance',
    description: 'Query the native token balance for an address',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The Ethereum address to check balance for',
        },
      },
      required: [],
    },
  },
};

describe('E2E: Live API Integration', () => {
  let walletManager: WalletManager;

  beforeAll(() => {
    if (!API_KEY) {
      console.warn('⚠️ Skipping live tests - OPENROUTER_API_KEY not set');
    }

    walletManager = new WalletManager({
      chains: [sepolia],
      defaultChain: sepolia,
    });
  });

  describe('OpenRouter API with Tools Format', () => {
    it('should successfully call OpenRouter API', async () => {
      if (!API_KEY) {
        console.log('Skipping - no API key');
        return;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/ArqonAi/LLM-Web3-Toolkit',
          'X-Title': 'LLM-Web3-Toolkit E2E Test',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: 'Say hello',
            },
          ],
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.choices).toBeDefined();
      expect(data.choices[0].message.content).toBeTruthy();
      
      console.log('✅ OpenRouter API working');
    }, 30000);

    it('should call validate_address function via OpenRouter', async () => {
      if (!API_KEY) {
        console.log('Skipping - no API key');
        return;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
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
              content: 'Validate this Ethereum address: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
            },
          ],
          tools: [validateAddressTool],
          tool_choice: 'auto',
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.choices).toBeDefined();
      expect(data.choices[0].message).toBeDefined();
      
      const message = data.choices[0].message;
      console.log('Response:', JSON.stringify(message, null, 2));

      if (message.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0];
        expect(toolCall.function.name).toBe('validate_address');
        
        const args = JSON.parse(toolCall.function.arguments);
        expect(args.address).toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

        // Execute the function
        const result = await walletManager.executeFunction('validate_address', args);
        expect(result.success).toBe(true);
        expect(result.data.valid).toBe(true);
        
        console.log('✅ Function calling working: validate_address');
      } else {
        console.log('⚠️ No tool call in response (LLM may have responded with text)');
      }
    }, 30000);

    it('should handle balance query', async () => {
      if (!API_KEY) {
        console.log('Skipping - no API key');
        return;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
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
              content: 'Check the balance of 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
            },
          ],
          tools: [getBalanceTool],
          tool_choice: 'auto',
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      const message = data.choices[0].message;
      console.log('Balance query response:', JSON.stringify(message, null, 2));

      if (message.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0];
        expect(toolCall.function.name).toBe('get_balance');
        console.log('✅ Function calling working: get_balance');
      }
    }, 30000);

    it('should handle multi-turn conversation with function execution', async () => {
      if (!API_KEY) {
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
          content: 'Validate the address 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        },
      ];

      // First turn
      const firstResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/ArqonAi/LLM-Web3-Toolkit',
          'X-Title': 'LLM-Web3-Toolkit E2E Test',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: conversationHistory,
          tools: [validateAddressTool],
          tool_choice: 'auto',
        }),
      });

      expect(firstResponse.ok).toBe(true);
      const firstData = await firstResponse.json();
      const firstMessage = firstData.choices[0].message;

      console.log('First turn:', JSON.stringify(firstMessage, null, 2));

      if (firstMessage.tool_calls && firstMessage.tool_calls.length > 0) {
        const toolCall = firstMessage.tool_calls[0];
        
        // Execute function
        const result = await walletManager.executeFunction(
          toolCall.function.name,
          JSON.parse(toolCall.function.arguments)
        );

        // Add to conversation
        conversationHistory.push(firstMessage);
        conversationHistory.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });

        // Second turn
        conversationHistory.push({
          role: 'user',
          content: 'What was the result?',
        });

        const secondResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/ArqonAi/LLM-Web3-Toolkit',
            'X-Title': 'LLM-Web3-Toolkit E2E Test',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: conversationHistory,
          }),
        });

        expect(secondResponse.ok).toBe(true);
        const secondData = await secondResponse.json();
        const secondMessage = secondData.choices[0].message;

        console.log('Second turn:', secondMessage.content);
        expect(secondMessage.content).toBeTruthy();
        
        console.log('✅ Multi-turn conversation working');
      }
    }, 60000);
  });
});
