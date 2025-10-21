/**
 * Example: Grok (xAI) and Gemini Integration
 * 
 * Demonstrates Web3 function calling with Grok and Google Gemini
 */

import { WalletManager } from '../packages/core/src';
import { ethereum } from '../packages/chains/src/definitions';
import { openaiTools, gemini } from '../packages/functions/src';

const GROK_API_KEY = process.env.XAI_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Example 1: Grok (xAI) - Uses OpenAI-Compatible API
 */
async function grokExample() {
  console.log('\n=== Example 1: Grok (xAI) ===\n');

  if (!GROK_API_KEY) {
    console.log('⚠️ Skipping - XAI_API_KEY not set');
    return;
  }

  const wallet = new WalletManager({
    chains: [ethereum],
    defaultChain: ethereum,
  });

  // Grok uses OpenAI-compatible format
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: 'You are Grok, a witty AI with Web3 capabilities. Be helpful but add some humor.',
        },
        {
          role: 'user',
          content: 'Validate this Ethereum address: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        },
      ],
      tools: openaiTools.openAITools, // Same as OpenAI!
      tool_choice: 'auto',
    }),
  });

  const data = await response.json();
  console.log('Grok Response:', JSON.stringify(data, null, 2));

  // Execute tool calls (same as OpenAI)
  if (data.choices && data.choices[0].message.tool_calls) {
    for (const toolCall of data.choices[0].message.tool_calls) {
      console.log(`\n✅ Grok called: ${toolCall.function.name}`);
      
      const result = await wallet.executeFunction(
        toolCall.function.name,
        JSON.parse(toolCall.function.arguments)
      );
      
      console.log('Result:', result);
    }
  }
}

/**
 * Example 2: Google Gemini - Custom Format
 */
async function geminiExample() {
  console.log('\n=== Example 2: Google Gemini ===\n');

  if (!GEMINI_API_KEY) {
    console.log('⚠️ Skipping - GEMINI_API_KEY not set');
    console.log('Get free API key: https://aistudio.google.com/app/apikey');
    return;
  }

  // Gemini requires its SDK
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash', // Free tier available!
      tools: [{
        functionDeclarations: gemini.geminiFunctions,
      }],
    });

    const wallet = new WalletManager({
      chains: [ethereum],
      defaultChain: ethereum,
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(
      'Check if 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 is a valid Ethereum address'
    );

    const response = result.response;
    console.log('Gemini Response:', response.text());

    // Handle function calls
    const functionCalls = response.functionCalls();
    if (functionCalls && functionCalls.length > 0) {
      for (const funcCall of functionCalls) {
        console.log(`\n✅ Gemini called: ${funcCall.name}`);
        console.log('Arguments:', funcCall.args);

        // Execute function
        const executionResult = await wallet.executeFunction(
          funcCall.name,
          funcCall.args as any
        );

        console.log('Execution Result:', executionResult);

        // Send result back to Gemini
        const followUp = await chat.sendMessage([{
          functionResponse: {
            name: funcCall.name,
            response: executionResult,
          },
        }]);

        console.log('\nGemini Final Response:', followUp.response.text());
      }
    }
  } catch (error: any) {
    console.log('❌ Gemini SDK not installed. Run: npm install @google/generative-ai');
    console.log('Error:', error.message);
  }
}

/**
 * Example 3: Multi-Provider Comparison
 */
async function compareProviders() {
  console.log('\n=== Example 3: Provider Comparison ===\n');

  const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
  const prompt = `Validate this address: ${testAddress}`;

  console.log('Testing:', prompt);
  console.log('\nResults:\n');

  // Test Grok
  if (GROK_API_KEY) {
    const start = Date.now();
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [{ role: 'user', content: prompt }],
          tools: openaiTools.openAITools,
        }),
      });
      const time = Date.now() - start;
      const data = await response.json();
      
      console.log('✅ Grok:');
      console.log(`  - Response time: ${time}ms`);
      console.log(`  - Called function: ${data.choices[0].message.tool_calls?.[0]?.function.name || 'none'}`);
    } catch (error: any) {
      console.log('❌ Grok:', error.message);
    }
  }

  // Test Gemini
  if (GEMINI_API_KEY) {
    const start = Date.now();
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        tools: [{ functionDeclarations: gemini.geminiFunctions }],
      });

      const result = await model.generateContent(prompt);
      const time = Date.now() - start;
      const response = result.response;
      
      console.log('\n✅ Gemini:');
      console.log(`  - Response time: ${time}ms`);
      console.log(`  - Called function: ${response.functionCalls()?.[0]?.name || 'none'}`);
    } catch (error: any) {
      console.log('\n❌ Gemini:', error.message);
    }
  }

  if (!GROK_API_KEY && !GEMINI_API_KEY) {
    console.log('⚠️ No API keys set. Set XAI_API_KEY or GEMINI_API_KEY to test.');
  }
}

// Run examples
async function main() {
  console.log('🚀 Grok & Gemini Web3 Integration Examples\n');

  try {
    await grokExample();
    await geminiExample();
    await compareProviders();

    console.log('\n✅ Examples completed!\n');
    console.log('💡 Key Takeaways:');
    console.log('   - Grok: Uses OpenAI format (easy!)');
    console.log('   - Gemini: Custom format (more setup)');
    console.log('   - Both: Full Web3 support!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  main();
}

export { grokExample, geminiExample, compareProviders };
