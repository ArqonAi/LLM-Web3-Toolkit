/**
 * Web3 Tools - Working Implementations
 * Only includes the 16 fully implemented and tested functions
 */

export interface Web3Tool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, any>
      required?: string[]
    }
  }
}

// 1. Get wallet address
export const getWalletAddress: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_wallet_address',
    description: 'Get the currently connected wallet address',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
}

// 2. Get native balance
export const getBalance: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_balance',
    description: 'Get the native token balance (ETH, SOL, or TRX) of the connected wallet',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
}

// 3. Get token balance
export const getTokenBalance: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_token_balance',
    description: 'Get the balance of a specific ERC-20 or SPL token',
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'The contract address of the token'
        }
      },
      required: ['token_address']
    }
  }
}

// 4. Send native tokens
export const sendNative: Web3Tool = {
  type: 'function',
  function: {
    name: 'send_native',
    description: 'Send native tokens (ETH, SOL, or TRX) to another address',
    parameters: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Recipient wallet address'
        },
        amount: {
          type: 'string',
          description: 'Amount to send in native token units'
        }
      },
      required: ['to', 'amount']
    }
  }
}

// 5. Send tokens
export const sendToken: Web3Tool = {
  type: 'function',
  function: {
    name: 'send_token',
    description: 'Send ERC-20 or SPL tokens to another address',
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'The contract address of the token'
        },
        to: {
          type: 'string',
          description: 'Recipient wallet address'
        },
        amount: {
          type: 'string',
          description: 'Amount to send in token units'
        }
      },
      required: ['token_address', 'to', 'amount']
    }
  }
}

// 6. Validate address
export const validateAddress: Web3Tool = {
  type: 'function',
  function: {
    name: 'validate_address',
    description: 'Validate if a wallet address is properly formatted for the current blockchain',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The wallet address to validate'
        }
      },
      required: ['address']
    }
  }
}

// 7. Get gas price
export const getGasPrice: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_gas_price',
    description: 'Get the current gas price for transactions on Ethereum-based networks',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
}

// 8. Switch chain
export const switchChain: Web3Tool = {
  type: 'function',
  function: {
    name: 'switch_chain',
    description: 'Switch to a different blockchain network',
    parameters: {
      type: 'object',
      properties: {
        chain_id: {
          type: 'number',
          description: 'The chain ID to switch to (e.g., 1 for Ethereum mainnet, 137 for Polygon)'
        }
      },
      required: ['chain_id']
    }
  }
}

// 9. Resolve ENS
export const resolveENS: Web3Tool = {
  type: 'function',
  function: {
    name: 'resolve_ens',
    description: 'Resolve an ENS name to its Ethereum address',
    parameters: {
      type: 'object',
      properties: {
        ens_name: {
          type: 'string',
          description: 'The ENS name to resolve (e.g., vitalik.eth)'
        }
      },
      required: ['ens_name']
    }
  }
}

// 10. Get transaction history
export const getTransactionHistory: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_transaction_history',
    description: 'Get the transaction history for a wallet address',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The wallet address to get history for'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of transactions to return (default: 10)'
        }
      },
      required: ['address']
    }
  }
}

// 11. Get block info
export const getBlockInfo: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_block_info',
    description: 'Get information about a specific block on the blockchain',
    parameters: {
      type: 'object',
      properties: {
        block_number: {
          type: 'string',
          description: 'The block number (or "latest" for most recent block)'
        }
      },
      required: ['block_number']
    }
  }
}

// 12. Analyze contract
export const analyzeContract: Web3Tool = {
  type: 'function',
  function: {
    name: 'analyze_contract',
    description: 'Analyze a smart contract to get basic information and security insights',
    parameters: {
      type: 'object',
      properties: {
        contract_address: {
          type: 'string',
          description: 'The smart contract address to analyze'
        }
      },
      required: ['contract_address']
    }
  }
}

// 13. Get token info
export const getTokenInfo: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_token_info',
    description: 'Get detailed information about an ERC-20 token (name, symbol, decimals, supply)',
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'The token contract address'
        }
      },
      required: ['token_address']
    }
  }
}

// 14. Get NFT holdings
export const getNFTHoldings: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_nft_holdings',
    description: 'Get all NFTs owned by a wallet address',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The wallet address to check NFTs for'
        }
      },
      required: ['address']
    }
  }
}

// 15. Scan address risk
export const scanAddressRisk: Web3Tool = {
  type: 'function',
  function: {
    name: 'scan_address_risk',
    description: 'Scan a wallet address for security risks and suspicious activity',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The wallet address to scan'
        }
      },
      required: ['address']
    }
  }
}

// 16. Get network stats
export const getNetworkStats: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_network_stats',
    description: 'Get current network statistics (gas price, block number, network congestion)',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
}

/**
 * All working Web3 tools (16 total)
 */
export const workingTools: Web3Tool[] = [
  getWalletAddress,
  getBalance,
  getTokenBalance,
  sendNative,
  sendToken,
  validateAddress,
  getGasPrice,
  switchChain,
  resolveENS,
  getTransactionHistory,
  getBlockInfo,
  analyzeContract,
  getTokenInfo,
  getNFTHoldings,
  scanAddressRisk,
  getNetworkStats
]

/**
 * Read-only tools (no user approval required)
 */
export const readOnlyTools: Web3Tool[] = [
  getWalletAddress,
  getBalance,
  getTokenBalance,
  validateAddress,
  getGasPrice,
  resolveENS,
  getTransactionHistory,
  getBlockInfo,
  analyzeContract,
  getTokenInfo,
  getNFTHoldings,
  scanAddressRisk,
  getNetworkStats
]

/**
 * Write tools (require user approval)
 */
export const writeTools: Web3Tool[] = [
  sendNative,
  sendToken,
  switchChain
]
