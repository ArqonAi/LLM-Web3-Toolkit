/**
 * Smart Contract Functions for OpenAI
 * 
 * Function calling schemas for smart contract interactions
 */

export interface OpenAIFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const readContract: OpenAIFunction = {
  name: 'read_contract',
  description: 'Read data from a smart contract (view/pure functions). Does not require gas.',
  parameters: {
    type: 'object',
    properties: {
      contractAddress: {
        type: 'string',
        description: 'The smart contract address to read from',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
      functionSignature: {
        type: 'string',
        description: 'Function signature (e.g., "balanceOf(address)")',
      },
      args: {
        type: 'array',
        description: 'Function arguments as an array',
        items: {
          oneOf: [
            { type: 'string' },
            { type: 'number' },
            { type: 'boolean' },
          ],
        },
      },
    },
    required: ['contractAddress', 'functionSignature'],
  },
};

export const writeContract: OpenAIFunction = {
  name: 'write_contract',
  description: 'Execute a state-changing function on a smart contract. Requires user approval and gas.',
  parameters: {
    type: 'object',
    properties: {
      contractAddress: {
        type: 'string',
        description: 'The smart contract address to interact with',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
      functionSignature: {
        type: 'string',
        description: 'Function signature (e.g., "transfer(address,uint256)")',
      },
      args: {
        type: 'array',
        description: 'Function arguments as an array',
        items: {
          oneOf: [
            { type: 'string' },
            { type: 'number' },
            { type: 'boolean' },
          ],
        },
      },
      value: {
        type: 'string',
        description: 'Amount of ETH to send with transaction (in ETH, e.g., "0.1")',
        pattern: '^[0-9]+(\\.[0-9]+)?$',
      },
    },
    required: ['contractAddress', 'functionSignature'],
  },
};

export const getContractEvents: OpenAIFunction = {
  name: 'get_contract_events',
  description: 'Query historical events emitted by a smart contract',
  parameters: {
    type: 'object',
    properties: {
      contractAddress: {
        type: 'string',
        description: 'The smart contract address',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
      eventName: {
        type: 'string',
        description: 'Name of the event to query (e.g., "Transfer")',
      },
      fromBlock: {
        type: 'string',
        description: 'Starting block number (or "latest")',
      },
      toBlock: {
        type: 'string',
        description: 'Ending block number (or "latest")',
      },
    },
    required: ['contractAddress', 'eventName'],
  },
};

export const deployContract: OpenAIFunction = {
  name: 'deploy_contract',
  description: 'Deploy a new smart contract to the blockchain. Requires user approval.',
  parameters: {
    type: 'object',
    properties: {
      bytecode: {
        type: 'string',
        description: 'Contract bytecode (hex string starting with 0x)',
        pattern: '^0x[a-fA-F0-9]+$',
      },
      constructorArgs: {
        type: 'array',
        description: 'Constructor arguments',
        items: {
          oneOf: [
            { type: 'string' },
            { type: 'number' },
            { type: 'boolean' },
          ],
        },
      },
      value: {
        type: 'string',
        description: 'Amount of ETH to send with deployment (in ETH)',
        pattern: '^[0-9]+(\\.[0-9]+)?$',
      },
    },
    required: ['bytecode'],
  },
};

export const encodeFunction: OpenAIFunction = {
  name: 'encode_function',
  description: 'Encode a function call into transaction data (for advanced use)',
  parameters: {
    type: 'object',
    properties: {
      functionSignature: {
        type: 'string',
        description: 'Function signature (e.g., "transfer(address,uint256)")',
      },
      args: {
        type: 'array',
        description: 'Function arguments',
        items: {
          oneOf: [
            { type: 'string' },
            { type: 'number' },
            { type: 'boolean' },
          ],
        },
      },
    },
    required: ['functionSignature'],
  },
};

/**
 * Common ERC-20 token functions
 */
export const erc20Transfer: OpenAIFunction = {
  name: 'erc20_transfer',
  description: 'Transfer ERC-20 tokens to a recipient. Simpler interface than write_contract.',
  parameters: {
    type: 'object',
    properties: {
      tokenAddress: {
        type: 'string',
        description: 'ERC-20 token contract address',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
      to: {
        type: 'string',
        description: 'Recipient address',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
      amount: {
        type: 'string',
        description: 'Amount of tokens to transfer (in token units)',
      },
    },
    required: ['tokenAddress', 'to', 'amount'],
  },
};

export const erc20Approve: OpenAIFunction = {
  name: 'erc20_approve',
  description: 'Approve a spender to transfer tokens on your behalf (required for DEX, lending, etc.)',
  parameters: {
    type: 'object',
    properties: {
      tokenAddress: {
        type: 'string',
        description: 'ERC-20 token contract address',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
      spender: {
        type: 'string',
        description: 'Address to approve (usually a smart contract)',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
      amount: {
        type: 'string',
        description: 'Amount to approve (use "unlimited" for max approval)',
      },
    },
    required: ['tokenAddress', 'spender', 'amount'],
  },
};

export const erc20Allowance: OpenAIFunction = {
  name: 'erc20_allowance',
  description: 'Check how much a spender is approved to spend',
  parameters: {
    type: 'object',
    properties: {
      tokenAddress: {
        type: 'string',
        description: 'ERC-20 token contract address',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
      owner: {
        type: 'string',
        description: 'Token owner address',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
      spender: {
        type: 'string',
        description: 'Spender address',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
    },
    required: ['tokenAddress', 'owner', 'spender'],
  },
};

/**
 * All contract interaction functions
 */
export const contractFunctions: OpenAIFunction[] = [
  readContract,
  writeContract,
  getContractEvents,
  deployContract,
  encodeFunction,
  erc20Transfer,
  erc20Approve,
  erc20Allowance,
];

/**
 * Read-only contract functions
 */
export const readOnlyContractFunctions: OpenAIFunction[] = [
  readContract,
  getContractEvents,
  encodeFunction,
  erc20Allowance,
];

/**
 * Write contract functions (require approval)
 */
export const writeContractFunctions: OpenAIFunction[] = [
  writeContract,
  deployContract,
  erc20Transfer,
  erc20Approve,
];
