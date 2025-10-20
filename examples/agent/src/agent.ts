/**
 * Autonomous Web3 Agent Example
 * 
 * Demonstrates autonomous agent that can execute Web3 operations
 * based on natural language instructions using LLM function calling.
 */

import dotenv from 'dotenv';
import { WalletManager } from '@arqon/web3-core';
import { sepolia } from '@arqon/web3-chains';
import { openAIFunctions } from '@arqon/web3-functions/openai';

dotenv.config();

interface AgentConfig {
  apiKey: string;
  model: string;
  maxIterations: number;
}

class Web3Agent {
  private walletManager: WalletManager;
  private config: AgentConfig;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor(config: AgentConfig) {
    this.config = config;
    this.walletManager = new WalletManager({
      chains: [sepolia],
      defaultChain: sepolia,
    });

    this.conversationHistory.push({
      role: 'system',
      content: `You are a Web3 autonomous agent with access to blockchain functions.
      
Available functions:
${openAIFunctions.map(f => `- ${f.name}: ${f.description}`).join('\n')}

Execute functions when users request blockchain operations. Always validate addresses and amounts before executing transactions.`,
    });
  }

  async run(task: string): Promise<void> {
    console.log('\n=== Web3 Agent Starting ===');
    console.log(`Task: ${task}\n`);

    this.conversationHistory.push({
      role: 'user',
      content: task,
    });

    let iteration = 0;
    let completed = false;

    while (iteration < this.config.maxIterations && !completed) {
      iteration++;
      console.log(`\n--- Iteration ${iteration} ---`);

      try {
        const response = await this.callLLM();
        const message = response.choices[0].message;

        if (message.function_call) {
          console.log(`Function call: ${message.function_call.name}`);
          console.log(`Arguments:`, JSON.parse(message.function_call.arguments));

          const result = await this.executeFunction(
            message.function_call.name,
            JSON.parse(message.function_call.arguments)
          );

          console.log(`Result:`, result);

          this.conversationHistory.push({
            role: 'assistant',
            content: message.content || '',
          });

          this.conversationHistory.push({
            role: 'function',
            name: message.function_call.name,
            content: JSON.stringify(result),
          } as any);
        } else {
          console.log(`Agent response: ${message.content}`);
          this.conversationHistory.push({
            role: 'assistant',
            content: message.content,
          });
          completed = true;
        }
      } catch (error: any) {
        console.error(`Error in iteration ${iteration}:`, error.message);
        break;
      }
    }

    console.log('\n=== Agent Completed ===\n');
  }

  private async callLLM(): Promise<any> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/ArqonAi/LLM-Web3-Toolkit',
        'X-Title': 'LLM-Web3-Toolkit Agent Example',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: this.conversationHistory,
        functions: openAIFunctions,
        function_call: 'auto',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LLM API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  private async executeFunction(name: string, args: any): Promise<any> {
    try {
      const result = await this.walletManager.executeFunction(name, args);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('Error: OPENROUTER_API_KEY not set in environment');
    process.exit(1);
  }

  const agent = new Web3Agent({
    apiKey,
    model: 'openai/gpt-4o-mini',
    maxIterations: 5,
  });

  const tasks = [
    'Validate this Ethereum address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    'Check the balance of address 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    'Estimate gas for sending 0.001 ETH to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  ];

  for (const task of tasks) {
    await agent.run(task);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

main().catch(console.error);
