/**
 * Ollama Local AI Integration
 * Fully private, no API keys needed!
 */

import { WalletManager } from '../packages/core/src';
import { ethereum } from '../packages/chains/src/definitions';
import { openaiTools } from '../packages/functions/src';

async function ollamaExample() {
  console.log('🏠 Local Ollama Integration\n');

  const wallet = new WalletManager({
    chains: [ethereum],
    defaultChain: ethereum,
  });

  try {
    const response = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: [{
          role: 'user',
          content: 'Validate address 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
        }],
        tools: openaiTools.openAITools, // Same as OpenAI!
      }),
    });

    const data = await response.json();
    
    if (data.choices[0].message.tool_calls) {
      const toolCall = data.choices[0].message.tool_calls[0];
      const result = await wallet.executeFunction(
        toolCall.function.name,
        JSON.parse(toolCall.function.arguments)
      );
      console.log('✅ Result:', result);
    }
  } catch (error: any) {
    console.log('❌ Start Ollama: ollama serve');
    console.log('📦 Install model: ollama pull llama3.2');
  }
}

ollamaExample();
