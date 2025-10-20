/**
 * Node.js Backend Example
 * 
 * Express server demonstrating LLM-Web3 integration
 * with OpenRouter API and Web3 function execution.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { openAIFunctions } from '@arqon/web3-functions/openai';
import { anthropicTools } from '@arqon/web3-functions/anthropic';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/functions', (req, res) => {
  res.json({
    openai: openAIFunctions,
    anthropic: anthropicTools,
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, provider = 'openai', model = 'openai/gpt-4o-mini' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const functions = provider === 'anthropic' ? anthropicTools : openAIFunctions;
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/ArqonAi/LLM-Web3-Toolkit',
        'X-Title': 'LLM-Web3-Toolkit Node.js Example',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a Web3 assistant with access to blockchain functions. Help users interact with Ethereum and other networks.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        functions: provider === 'anthropic' ? undefined : functions,
        tools: provider === 'anthropic' ? functions : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const llmMessage = data.choices[0].message;

    if (llmMessage.function_call) {
      return res.json({
        type: 'function_call',
        function: llmMessage.function_call.name,
        arguments: JSON.parse(llmMessage.function_call.arguments),
        message: llmMessage.content,
      });
    }

    if (llmMessage.tool_calls && llmMessage.tool_calls.length > 0) {
      return res.json({
        type: 'tool_call',
        tools: llmMessage.tool_calls.map((tc: any) => ({
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments),
        })),
        message: llmMessage.content,
      });
    }

    res.json({
      type: 'message',
      message: llmMessage.content,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/execute-function', async (req, res) => {
  try {
    const { function_name, arguments: args } = req.body;

    console.log(`Execute function: ${function_name}`, args);

    res.json({
      success: true,
      function: function_name,
      arguments: args,
      result: {
        message: 'Function execution simulated. In production, this would call WalletManager.executeFunction()',
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`LLM-Web3-Toolkit Node.js server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Functions: http://localhost:${PORT}/api/functions`);
  console.log(`Chat: POST http://localhost:${PORT}/api/chat`);
});
