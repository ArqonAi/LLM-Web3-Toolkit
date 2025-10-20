/**
 * OpenAI Function Calling Schemas
 * 
 * Standardized function definitions for Web3 operations compatible
 * with OpenAI's function calling API (GPT-4, GPT-3.5-turbo, etc.)
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

export const getWalletAddress: OpenAIFunction = {
  name: 'get_wallet_address',
  description: 'Retrieve the currently connected wallet address',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const getBalance: OpenAIFunction = {
  name: 'get_balance',
  description: 'Query the native token balance (ETH, etc.) for an address',
  parameters: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        description: 'The Ethereum address to check balance for. If omitted, uses connected wallet address.',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
    },
    required: [],
  },
};

export const getTokenBalance: OpenAIFunction = {
  name: 'get_token_balance',
  description: 'Query ERC-20 token balance for a specific token contract',
  parameters: {
    type: 'object',
    properties: {
      tokenAddress: {
        type: 'string',
        description: 'The ERC-20 token contract address',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
      ownerAddress: {
        type: 'string',
        description: 'The wallet address to check. If omitted, uses connected wallet.',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
    },
    required: ['tokenAddress'],
  },
};

export const sendNative: OpenAIFunction = {
  name: 'send_native',
  description: 'Send native tokens (ETH, etc.) to a recipient address. Requires user approval.',
  parameters: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient Ethereum address',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
      amount: {
        type: 'string',
        description: 'Amount to send in ETH (e.g., "0.1" for 0.1 ETH)',
        pattern: '^[0-9]+(\\.[0-9]+)?$',
      },
    },
    required: ['to', 'amount'],
  },
};

export const sendToken: OpenAIFunction = {
  name: 'send_token',
  description: 'Transfer ERC-20 tokens to a recipient. Requires user approval.',
  parameters: {
    type: 'object',
    properties: {
      tokenAddress: {
        type: 'string',
        description: 'The ERC-20 token contract address',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
      to: {
        type: 'string',
        description: 'Recipient Ethereum address',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
      amount: {
        type: 'string',
        description: 'Amount of tokens to send (in token units)',
        pattern: '^[0-9]+(\\.[0-9]+)?$',
      },
    },
    required: ['tokenAddress', 'to', 'amount'],
  },
};

export const estimateGas: OpenAIFunction = {
  name: 'estimate_gas',
  description: 'Estimate gas cost for a transaction before execution',
  parameters: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Transaction recipient address',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
      value: {
        type: 'string',
        description: 'Transaction value in ETH (optional)',
      },
      data: {
        type: 'string',
        description: 'Transaction data (optional, for contract interactions)',
        pattern: '^0x[a-fA-F0-9]*$',
      },
    },
    required: ['to'],
  },
};

export const validateAddress: OpenAIFunction = {
  name: 'validate_address',
  description: 'Validate if a string is a properly formatted Ethereum address',
  parameters: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        description: 'The address string to validate',
      },
    },
    required: ['address'],
  },
};

export const switchChain: OpenAIFunction = {
  name: 'switch_chain',
  description: 'Switch the active blockchain network',
  parameters: {
    type: 'object',
    properties: {
      chainId: {
        type: 'number',
        description: 'The chain ID to switch to (e.g., 1 for Ethereum mainnet, 42161 for Arbitrum)',
      },
    },
    required: ['chainId'],
  },
};

export const getGasPrice: OpenAIFunction = {
  name: 'get_gas_price',
  description: 'Get current gas price on the active network',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const resolveENS: OpenAIFunction = {
  name: 'resolve_ens',
  description: 'Resolve an ENS name to an Ethereum address',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The ENS name to resolve (e.g., "vitalik.eth")',
        pattern: '^[a-z0-9-]+\\.eth$',
      },
    },
    required: ['name'],
  },
};

export const lookupENS: OpenAIFunction = {
  name: 'lookup_ens',
  description: 'Reverse lookup an Ethereum address to find associated ENS name',
  parameters: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        description: 'The Ethereum address to lookup',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
    },
    required: ['address'],
  },
};

/**
 * All Web3 functions for OpenAI function calling
 */
export const openAIFunctions: OpenAIFunction[] = [
  getWalletAddress,
  getBalance,
  getTokenBalance,
  sendNative,
  sendToken,
  estimateGas,
  validateAddress,
  switchChain,
  getGasPrice,
  resolveENS,
  lookupENS,
];

/**
 * Read-only functions (no user approval required)
 */
export const readOnlyFunctions: OpenAIFunction[] = [
  getWalletAddress,
  getBalance,
  getTokenBalance,
  validateAddress,
  getGasPrice,
  resolveENS,
  lookupENS,
];

/**
 * Write functions (require user approval)
 */
export const writeFunctions: OpenAIFunction[] = [
  sendNative,
  sendToken,
  switchChain,
];
