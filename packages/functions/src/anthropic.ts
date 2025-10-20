/**
 * Anthropic Claude Tool Schemas
 * 
 * Standardized tool definitions for Web3 operations compatible
 * with Anthropic's Claude tool use API
 */

export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const getWalletAddress: AnthropicTool = {
  name: 'get_wallet_address',
  description: 'Retrieve the currently connected wallet address',
  input_schema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const getBalance: AnthropicTool = {
  name: 'get_balance',
  description: 'Query the native token balance (ETH, MATIC, AVAX, etc.) for an address. Returns the balance in both raw wei and formatted ETH.',
  input_schema: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        description: 'The Ethereum address to check balance for. Must be a valid 0x-prefixed hex address. If omitted, uses the connected wallet address.',
      },
    },
    required: [],
  },
};

export const getTokenBalance: AnthropicTool = {
  name: 'get_token_balance',
  description: 'Query ERC-20 token balance for a specific token contract address. Returns balance with token metadata.',
  input_schema: {
    type: 'object',
    properties: {
      tokenAddress: {
        type: 'string',
        description: 'The ERC-20 token contract address (0x-prefixed)',
      },
      ownerAddress: {
        type: 'string',
        description: 'The wallet address to check balance for. If omitted, uses connected wallet.',
      },
    },
    required: ['tokenAddress'],
  },
};

export const sendNative: AnthropicTool = {
  name: 'send_native',
  description: 'Send native blockchain tokens (ETH, MATIC, etc.) to a recipient address. This operation requires explicit user approval via wallet interface.',
  input_schema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient Ethereum address (0x-prefixed, 40 hex characters)',
      },
      amount: {
        type: 'string',
        description: 'Amount to send in ETH units (e.g., "0.1" for 0.1 ETH, "1.5" for 1.5 ETH)',
      },
    },
    required: ['to', 'amount'],
  },
};

export const sendToken: AnthropicTool = {
  name: 'send_token',
  description: 'Transfer ERC-20 tokens to a recipient address. Requires user approval via wallet.',
  input_schema: {
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
        description: 'Amount of tokens to send in token units',
      },
    },
    required: ['tokenAddress', 'to', 'amount'],
  },
};

export const estimateGas: AnthropicTool = {
  name: 'estimate_gas',
  description: 'Calculate gas cost estimates for a transaction before execution. Returns gas limit, gas price, and total estimated cost.',
  input_schema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Transaction recipient address',
      },
      value: {
        type: 'string',
        description: 'Transaction value in ETH (optional)',
      },
      data: {
        type: 'string',
        description: 'Transaction data for contract interactions (optional, 0x-prefixed hex)',
      },
    },
    required: ['to'],
  },
};

export const validateAddress: AnthropicTool = {
  name: 'validate_address',
  description: 'Validate if a string is a properly formatted Ethereum address with correct checksum',
  input_schema: {
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

export const switchChain: AnthropicTool = {
  name: 'switch_chain',
  description: 'Switch the active blockchain network. Common chain IDs: 1 (Ethereum), 42161 (Arbitrum), 10 (Optimism), 8453 (Base), 137 (Polygon)',
  input_schema: {
    type: 'object',
    properties: {
      chainId: {
        type: 'number',
        description: 'The numeric chain ID to switch to',
      },
    },
    required: ['chainId'],
  },
};

export const getGasPrice: AnthropicTool = {
  name: 'get_gas_price',
  description: 'Get current gas price information on the active network including base fee and priority fee',
  input_schema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const resolveENS: AnthropicTool = {
  name: 'resolve_ens',
  description: 'Resolve an Ethereum Name Service (ENS) domain name to its associated Ethereum address',
  input_schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The ENS name to resolve (must end in .eth)',
      },
    },
    required: ['name'],
  },
};

export const lookupENS: AnthropicTool = {
  name: 'lookup_ens',
  description: 'Perform reverse ENS lookup to find the primary ENS name associated with an Ethereum address',
  input_schema: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        description: 'The Ethereum address to lookup',
      },
    },
    required: ['address'],
  },
};

/**
 * All Web3 tools for Anthropic Claude
 */
export const anthropicTools: AnthropicTool[] = [
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
 * Read-only tools (no user approval required)
 */
export const readOnlyTools: AnthropicTool[] = [
  getWalletAddress,
  getBalance,
  getTokenBalance,
  validateAddress,
  getGasPrice,
  resolveENS,
  lookupENS,
];

/**
 * Write tools (require user approval)
 */
export const writeTools: AnthropicTool[] = [
  sendNative,
  sendToken,
  switchChain,
];
