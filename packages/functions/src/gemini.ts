/**
 * Google Gemini Function Calling Schemas
 * 
 * Gemini uses a different format than OpenAI
 * https://ai.google.dev/gemini-api/docs/function-calling
 */

export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      items?: any;
    }>;
    required: string[];
  };
}

export const getWalletAddress: GeminiFunctionDeclaration = {
  name: 'get_wallet_address',
  description: 'Get the currently connected wallet address',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const getBalance: GeminiFunctionDeclaration = {
  name: 'get_balance',
  description: 'Query the native token balance (ETH, etc.) for an address',
  parameters: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        description: 'The Ethereum address to check balance for. If omitted, uses connected wallet address.',
      },
    },
    required: [],
  },
};

export const getTokenBalance: GeminiFunctionDeclaration = {
  name: 'get_token_balance',
  description: 'Query ERC-20 token balance for a specific token contract',
  parameters: {
    type: 'object',
    properties: {
      tokenAddress: {
        type: 'string',
        description: 'The ERC-20 token contract address',
      },
      ownerAddress: {
        type: 'string',
        description: 'The wallet address to check. If omitted, uses connected wallet.',
      },
    },
    required: ['tokenAddress'],
  },
};

export const sendNative: GeminiFunctionDeclaration = {
  name: 'send_native',
  description: 'Send native tokens (ETH, etc.) to a recipient address. Requires user approval.',
  parameters: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient Ethereum address',
      },
      amount: {
        type: 'string',
        description: 'Amount to send in ETH (e.g., "0.1" for 0.1 ETH)',
      },
    },
    required: ['to', 'amount'],
  },
};

export const sendToken: GeminiFunctionDeclaration = {
  name: 'send_token',
  description: 'Transfer ERC-20 tokens to a recipient. Requires user approval.',
  parameters: {
    type: 'object',
    properties: {
      tokenAddress: {
        type: 'string',
        description: 'The ERC-20 token contract address',
      },
      to: {
        type: 'string',
        description: 'Recipient Ethereum address',
      },
      amount: {
        type: 'string',
        description: 'Amount of tokens to send',
      },
    },
    required: ['tokenAddress', 'to', 'amount'],
  },
};

export const estimateGas: GeminiFunctionDeclaration = {
  name: 'estimate_gas',
  description: 'Calculate the estimated gas cost for a transaction before executing it',
  parameters: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Transaction recipient address',
      },
      value: {
        type: 'string',
        description: 'Amount of ETH to send (optional)',
      },
      data: {
        type: 'string',
        description: 'Transaction data (optional)',
      },
    },
    required: ['to'],
  },
};

export const validateAddress: GeminiFunctionDeclaration = {
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

export const switchChain: GeminiFunctionDeclaration = {
  name: 'switch_chain',
  description: 'Switch the active blockchain network',
  parameters: {
    type: 'object',
    properties: {
      chainId: {
        type: 'number',
        description: 'Chain ID to switch to (e.g., 1 for Ethereum, 137 for Polygon)',
      },
    },
    required: ['chainId'],
  },
};

export const getGasPrice: GeminiFunctionDeclaration = {
  name: 'get_gas_price',
  description: 'Get current gas prices for the active network',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const resolveENS: GeminiFunctionDeclaration = {
  name: 'resolve_ens',
  description: 'Resolve an ENS domain name to an Ethereum address',
  parameters: {
    type: 'object',
    properties: {
      ensName: {
        type: 'string',
        description: 'ENS domain name (e.g., "vitalik.eth")',
      },
    },
    required: ['ensName'],
  },
};

export const lookupENS: GeminiFunctionDeclaration = {
  name: 'lookup_ens',
  description: 'Reverse lookup: get ENS name for an Ethereum address',
  parameters: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        description: 'Ethereum address to lookup',
      },
    },
    required: ['address'],
  },
};

// Contract functions
export const readContract: GeminiFunctionDeclaration = {
  name: 'read_contract',
  description: 'Read data from a smart contract (view/pure functions). Does not require gas.',
  parameters: {
    type: 'object',
    properties: {
      contractAddress: {
        type: 'string',
        description: 'The smart contract address to read from',
      },
      functionSignature: {
        type: 'string',
        description: 'Function signature (e.g., "balanceOf(address)")',
      },
      args: {
        type: 'array',
        description: 'Function arguments as an array',
        items: {
          type: 'string',
        },
      },
    },
    required: ['contractAddress', 'functionSignature'],
  },
};

export const writeContract: GeminiFunctionDeclaration = {
  name: 'write_contract',
  description: 'Execute a state-changing function on a smart contract. Requires user approval and gas.',
  parameters: {
    type: 'object',
    properties: {
      contractAddress: {
        type: 'string',
        description: 'The smart contract address to interact with',
      },
      functionSignature: {
        type: 'string',
        description: 'Function signature (e.g., "transfer(address,uint256)")',
      },
      args: {
        type: 'array',
        description: 'Function arguments as an array',
        items: {
          type: 'string',
        },
      },
      value: {
        type: 'string',
        description: 'Amount of ETH to send with transaction (in ETH, e.g., "0.1")',
      },
    },
    required: ['contractAddress', 'functionSignature'],
  },
};

/**
 * All Web3 functions for Gemini
 */
export const geminiFunctions: GeminiFunctionDeclaration[] = [
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
  readContract,
  writeContract,
];

/**
 * Read-only functions (no user approval required)
 */
export const readOnlyFunctions: GeminiFunctionDeclaration[] = [
  getWalletAddress,
  getBalance,
  getTokenBalance,
  validateAddress,
  getGasPrice,
  resolveENS,
  lookupENS,
  readContract,
  estimateGas,
];

/**
 * Write functions (require user approval)
 */
export const writeFunctions: GeminiFunctionDeclaration[] = [
  sendNative,
  sendToken,
  switchChain,
  writeContract,
];
