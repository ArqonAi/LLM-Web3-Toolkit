/**
 * Example: Smart Contract Interaction with LLMs
 * 
 * Demonstrates how to use ContractManager with OpenRouter
 * to enable LLMs to interact with smart contracts.
 */

import { WalletManager, ContractManager } from '../packages/core/src';
import { ethereum } from '../packages/chains/src/definitions';
import { contractTools } from '../packages/functions/src/contracts-tools';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

// Example: ERC-20 Token Contract
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC on Ethereum
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

/**
 * Example 1: Read Contract Data (No Wallet Required)
 */
async function readContractExample() {
  console.log('\n=== Example 1: Reading Contract Data ===\n');

  const contractManager = new ContractManager(ethereum);

  // Register USDC contract
  contractManager.registerContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    name: 'USDC',
  });

  // Read balance of Vitalik's address
  const vitalikAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
  
  const balance = await contractManager.read(
    USDC_ADDRESS,
    'balanceOf',
    [vitalikAddress]
  );

  console.log('USDC Balance:', balance.data?.toString());

  // Read decimals
  const decimals = await contractManager.read(USDC_ADDRESS, 'decimals');
  console.log('Decimals:', decimals.data);

  // Read symbol
  const symbol = await contractManager.read(USDC_ADDRESS, 'symbol');
  console.log('Symbol:', symbol.data);
}

/**
 * Example 2: Batch Read Multiple Contracts
 */
async function batchReadExample() {
  console.log('\n=== Example 2: Batch Read Multiple Contracts ===\n');

  const contractManager = new ContractManager(ethereum);
  contractManager.registerContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    name: 'USDC',
  });

  const vitalikAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

  // Batch read multiple values
  const results = await contractManager.batchRead([
    { address: USDC_ADDRESS, functionName: 'symbol' },
    { address: USDC_ADDRESS, functionName: 'decimals' },
    { address: USDC_ADDRESS, functionName: 'balanceOf', args: [vitalikAddress] },
  ]);

  console.log('Batch Results:');
  results.forEach((result, i) => {
    console.log(`  ${i + 1}.`, result.success ? result.data : result.error);
  });
}

/**
 * Example 3: OpenRouter LLM Integration
 */
async function llmContractInteraction() {
  console.log('\n=== Example 3: LLM Contract Interaction ===\n');

  if (!OPENROUTER_API_KEY) {
    console.log('⚠️ Skipping - OPENROUTER_API_KEY not set');
    return;
  }

  // Ask LLM to check USDC balance
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/ArqonAi/LLM-Web3-Toolkit',
      'X-Title': 'LLM-Web3-Toolkit Contract Example',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Web3 assistant with access to smart contract functions. USDC contract is at 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.',
        },
        {
          role: 'user',
          content: 'Check the USDC balance of address 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        },
      ],
      tools: contractTools.readOnlyContractTools,
      tool_choice: 'auto',
    }),
  });

  const data = await response.json();
  const message = data.choices[0].message;

  console.log('LLM Response:', JSON.stringify(message, null, 2));

  // If LLM called a function, execute it
  if (message.tool_calls && message.tool_calls.length > 0) {
    const toolCall = message.tool_calls[0];
    console.log('\n✅ LLM called function:', toolCall.function.name);
    console.log('Arguments:', toolCall.function.arguments);

    // Execute the function
    const contractManager = new ContractManager(ethereum);
    contractManager.registerContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      name: 'USDC',
    });

    const args = JSON.parse(toolCall.function.arguments);
    
    // Map tool call to contract function
    if (toolCall.function.name === 'read_contract') {
      const result = await contractManager.read(
        args.contractAddress,
        args.functionSignature.split('(')[0],
        args.args || []
      );
      
      console.log('\nFunction Result:', result);
    }
  }
}

/**
 * Example 4: Encode/Decode Functions
 */
async function encodeDecodeExample() {
  console.log('\n=== Example 4: Encode/Decode Functions ===\n');

  const contractManager = new ContractManager(ethereum);

  // Encode a transfer function call
  const encoded = contractManager.encodeFunctionCall(
    'transfer(address,uint256)',
    ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', '1000000'] // 1 USDC (6 decimals)
  );

  console.log('Encoded transfer() call:');
  console.log(encoded);

  // This encoded data can be used in raw transactions
  console.log('\nUse case: Send this as transaction data to USDC contract');
}

/**
 * Example 5: Query Events
 */
async function queryEventsExample() {
  console.log('\n=== Example 5: Query Contract Events ===\n');

  const contractManager = new ContractManager(ethereum);
  contractManager.registerContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    name: 'USDC',
  });

  try {
    // Query recent Transfer events
    const events = await contractManager.getEvents(
      USDC_ADDRESS,
      {
        eventName: 'Transfer',
        fromBlock: BigInt(21000000), // Recent block
        toBlock: BigInt(21000100),
      }
    );

    console.log(`Found ${events.length} Transfer events`);
    if (events.length > 0) {
      console.log('First event:', events[0]);
    }
  } catch (error: any) {
    console.log('Event query failed (expected if RPC limits):', error.message);
  }
}

// Run all examples
async function main() {
  console.log('🚀 Smart Contract Interaction Examples\n');

  try {
    await readContractExample();
    await batchReadExample();
    await encodeDecodeExample();
    await queryEventsExample();
    await llmContractInteraction();

    console.log('\n✅ All examples completed!\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export {
  readContractExample,
  batchReadExample,
  llmContractInteraction,
  encodeDecodeExample,
  queryEventsExample,
};
