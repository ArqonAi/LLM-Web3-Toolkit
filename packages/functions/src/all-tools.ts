/**
 * Web3 Function Tools for LLM Integration
 * Based on LLM-Web3-Toolkit
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
  implemented?: boolean // Track if backend implementation exists
  comingSoon?: boolean  // Show "Coming Soon" badge
}

// Get wallet address
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
  },
  implemented: true
}

// Get native balance (ETH, SOL, TRX)
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
  },
  implemented: true
}

// Get token balance
export const getTokenBalance: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_token_balance',
    description: 'Get the balance of a specific ERC-20 token',
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'The contract address of the ERC-20 token'
        }
      },
      required: ['token_address']
    }
  },
  implemented: true
}

// Send native tokens
export const sendNative: Web3Tool = {
  type: 'function',
  function: {
    name: 'send_native',
    description: 'Send native tokens (ETH, SOL, or TRX) to an address',
    parameters: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'The recipient address'
        },
        amount: {
          type: 'string',
          description: 'The amount to send in native token units (e.g., "0.1" for 0.1 ETH)'
        }
      },
      required: ['to', 'amount']
    }
  },
  implemented: true
}

// Send ERC-20 tokens
export const sendToken: Web3Tool = {
  type: 'function',
  function: {
    name: 'send_token',
    description: 'Send ERC-20 tokens to an address',
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'The contract address of the ERC-20 token'
        },
        to: {
          type: 'string',
          description: 'The recipient address'
        },
        amount: {
          type: 'string',
          description: 'The amount to send in token units'
        }
      },
      required: ['token_address', 'to', 'amount']
    }
  },
  implemented: true
}

// Validate address
export const validateAddress: Web3Tool = {
  type: 'function',
  function: {
    name: 'validate_address',
    description: 'Validate if a string is a valid blockchain address',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The address to validate'
        }
      },
      required: ['address']
    }
  },
  implemented: true
}

// Get gas price
export const getGasPrice: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_gas_price',
    description: 'Get the current gas price on the network',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  implemented: true
}

// Switch chain
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
          description: 'The chain ID to switch to (e.g., 1 for Ethereum, 137 for Polygon)'
        }
      },
      required: ['chain_id']
    }
  },
  implemented: true
}

// Resolve ENS
export const resolveENS: Web3Tool = {
  type: 'function',
  function: {
    name: 'resolve_ens',
    description: 'Resolve an ENS name to an Ethereum address',
    parameters: {
      type: 'object',
      properties: {
        ens_name: {
          type: 'string',
          description: 'The ENS name to resolve (e.g., "vitalik.eth")'
        }
      },
      required: ['ens_name']
    }
  },
  comingSoon: true
}

// Get transaction history
export const getTransactionHistory: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_transaction_history',
    description: 'Get recent transaction history for an address',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The address to get transaction history for (defaults to connected wallet)'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of transactions to return (default: 10)'
        }
      },
      required: []
    }
  },
  implemented: true
}

// Get block information
export const getBlockInfo: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_block_info',
    description: 'Get detailed information about a specific block',
    parameters: {
      type: 'object',
      properties: {
        block_number: {
          type: 'string',
          description: 'The block number or "latest" for the most recent block'
        }
      },
      required: ['block_number']
    }
  },
  implemented: true
}

// Analyze contract
export const analyzeContract: Web3Tool = {
  type: 'function',
  function: {
    name: 'analyze_contract',
    description: 'Analyze a smart contract address to get its details, verification status, and basic info',
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
  },
  implemented: true
}

// Get token info
export const getTokenInfo: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_token_info',
    description: 'Get detailed information about an ERC-20 token (name, symbol, decimals, total supply)',
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'The ERC-20 token contract address'
        }
      },
      required: ['token_address']
    }
  },
  implemented: true
}

// Get NFT holdings
export const getNFTHoldings: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_nft_holdings',
    description: 'Get all NFTs owned by an address',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The address to get NFTs for (defaults to connected wallet)'
        }
      },
      required: []
    }
  },
  comingSoon: true // Requires Alchemy/Moralis API
}

// Scan address for risks
export const scanAddressRisk: Web3Tool = {
  type: 'function',
  function: {
    name: 'scan_address_risk',
    description: 'Scan an address for potential security risks, scams, or suspicious activity',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The address to scan for risks'
        }
      },
      required: ['address']
    }
  },
  implemented: true
}

// Get network stats
export const getNetworkStats: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_network_stats',
    description: 'Get current network statistics (block height, gas price, pending transactions)',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  implemented: true
}

// ========================================
// PHASE 1: CRITICAL DEFI TOOLS
// ========================================

// Swap tokens using DEX aggregators
export const swapTokens: Web3Tool = {
  type: 'function',
  function: {
    name: 'swap_tokens',
    description: 'Swap tokens using DEX aggregators (Uniswap, 1inch, Jupiter). Automatically finds best price and route.',
    parameters: {
      type: 'object',
      properties: {
        from_token: {
          type: 'string',
          description: 'Token address to swap from (or "ETH" for native token)'
        },
        to_token: {
          type: 'string',
          description: 'Token address to swap to (or "ETH" for native token)'
        },
        amount: {
          type: 'string',
          description: 'Amount to swap in token units (e.g., "1.5" for 1.5 tokens)'
        },
        slippage: {
          type: 'number',
          description: 'Maximum slippage tolerance in percentage (default: 0.5)'
        },
        dex: {
          type: 'string',
          description: 'Preferred DEX (uniswap, 1inch, jupiter, auto for best price)'
        }
      },
      required: ['from_token', 'to_token', 'amount']
    }
  },
  comingSoon: true
}

// Get token price in USD/ETH
export const getTokenPrice: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_token_price',
    description: 'Get current token price in USD or other currencies with 24h change data',
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'Token contract address (or symbol like "ETH", "BTC")'
        },
        vs_currency: {
          type: 'string',
          description: 'Currency to price against (usd, eth, btc) - default: usd'
        },
        include_24h_change: {
          type: 'boolean',
          description: 'Include 24h price change percentage - default: true'
        },
        include_market_cap: {
          type: 'boolean',
          description: 'Include market cap and volume data - default: false'
        }
      },
      required: ['token_address']
    }
  },
  implemented: true
}

// Get total portfolio value
export const getPortfolioValue: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_portfolio_value',
    description: 'Calculate total portfolio value across all tokens, NFTs, and staked assets in USD',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Wallet address to analyze (defaults to connected wallet)'
        },
        include_nfts: {
          type: 'boolean',
          description: 'Include NFT floor prices in valuation - default: true'
        },
        include_staked: {
          type: 'boolean',
          description: 'Include staked/locked tokens - default: true'
        },
        breakdown: {
          type: 'boolean',
          description: 'Include detailed breakdown by token - default: true'
        }
      },
      required: []
    }
  },
  implemented: true
}

// Get liquidity pool information
export const getPoolInfo: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_pool_info',
    description: 'Get liquidity pool statistics including TVL, APR, volume, and fees',
    parameters: {
      type: 'object',
      properties: {
        pool_address: {
          type: 'string',
          description: 'LP token or pool contract address'
        },
        dex: {
          type: 'string',
          description: 'DEX protocol (uniswap-v2, uniswap-v3, curve, balancer, auto-detect)'
        },
        include_apy: {
          type: 'boolean',
          description: 'Calculate APY including compounding - default: true'
        }
      },
      required: ['pool_address']
    }
  }
}

// Add liquidity to pool
export const addLiquidity: Web3Tool = {
  type: 'function',
  function: {
    name: 'add_liquidity',
    description: 'Add liquidity to a DEX pool and receive LP tokens',
    parameters: {
      type: 'object',
      properties: {
        token_a: {
          type: 'string',
          description: 'First token address'
        },
        token_b: {
          type: 'string',
          description: 'Second token address'
        },
        amount_a: {
          type: 'string',
          description: 'Amount of token A to add'
        },
        amount_b: {
          type: 'string',
          description: 'Amount of token B to add'
        },
        dex: {
          type: 'string',
          description: 'DEX protocol (uniswap, pancakeswap, sushiswap)'
        },
        slippage: {
          type: 'number',
          description: 'Maximum slippage tolerance - default: 0.5'
        }
      },
      required: ['token_a', 'token_b', 'amount_a', 'amount_b']
    }
  }
}

// Remove liquidity from pool
export const removeLiquidity: Web3Tool = {
  type: 'function',
  function: {
    name: 'remove_liquidity',
    description: 'Remove liquidity from a DEX pool by burning LP tokens',
    parameters: {
      type: 'object',
      properties: {
        lp_token: {
          type: 'string',
          description: 'LP token contract address'
        },
        amount: {
          type: 'string',
          description: 'Amount of LP tokens to burn (or "all" for 100%)'
        },
        dex: {
          type: 'string',
          description: 'DEX protocol'
        }
      },
      required: ['lp_token', 'amount']
    }
  }
}

// ========================================
// PHASE 2: SECURITY & ANALYTICS TOOLS
// ========================================

// Verify token legitimacy (scam detection)
export const verifyTokenLegitimacy: Web3Tool = {
  type: 'function',
  function: {
    name: 'verify_token_legitimacy',
    description: 'Check if token is legitimate or potential scam. Detects honeypots, rugpulls, and suspicious contracts.',
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'Token contract address to verify'
        },
        check_honeypot: {
          type: 'boolean',
          description: 'Check for honeypot scams - default: true'
        },
        check_rugpull: {
          type: 'boolean',
          description: 'Check rugpull risk indicators - default: true'
        },
        check_liquidity: {
          type: 'boolean',
          description: 'Check liquidity lock status - default: true'
        }
      },
      required: ['token_address']
    }
  }
}

// Check token audit status
export const checkTokenAudit: Web3Tool = {
  type: 'function',
  function: {
    name: 'check_token_audit',
    description: 'Check if token has been audited and get security scores from CertiK, Slither, etc.',
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'Token contract address'
        },
        include_certik: {
          type: 'boolean',
          description: 'Include CertiK security score - default: true'
        },
        include_reports: {
          type: 'boolean',
          description: 'Include full audit report links - default: true'
        }
      },
      required: ['token_address']
    }
  }
}

// Track whale movements
export const trackWhaleMovements: Web3Tool = {
  type: 'function',
  function: {
    name: 'track_whale_movements',
    description: 'Track large token transfers and whale wallet activity for market intelligence',
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'Token to track (optional, tracks all if not specified)'
        },
        min_value_usd: {
          type: 'number',
          description: 'Minimum transfer value in USD - default: 100000'
        },
        time_range: {
          type: 'string',
          description: 'Time range (1h, 24h, 7d) - default: 24h'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of transfers to return - default: 50'
        }
      },
      required: []
    }
  }
}

// Analyze token holder distribution
export const analyzeTokenHolders: Web3Tool = {
  type: 'function',
  function: {
    name: 'analyze_token_holders',
    description: 'Analyze token holder distribution, concentration, whale wallets, and holder trends',
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'Token contract address to analyze'
        },
        top_n: {
          type: 'number',
          description: 'Number of top holders to analyze - default: 100'
        },
        include_concentration: {
          type: 'boolean',
          description: 'Include concentration metrics (Gini coefficient) - default: true'
        },
        include_trends: {
          type: 'boolean',
          description: 'Include holder growth trends - default: true'
        }
      },
      required: ['token_address']
    }
  }
}

// Get historical price data
export const getPriceHistory: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_price_history',
    description: 'Get historical price data for technical analysis and charting',
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'Token contract address or symbol'
        },
        timeframe: {
          type: 'string',
          description: 'Timeframe (1m, 5m, 15m, 1h, 4h, 1d, 1w) - default: 1h'
        },
        data_points: {
          type: 'number',
          description: 'Number of data points to return - default: 100'
        },
        vs_currency: {
          type: 'string',
          description: 'Currency to price against - default: usd'
        }
      },
      required: ['token_address']
    }
  },
  implemented: true
}

// Get contract events
export const getContractEvents: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_contract_events',
    description: 'Get recent events emitted by a smart contract for monitoring and analysis',
    parameters: {
      type: 'object',
      properties: {
        contract_address: {
          type: 'string',
          description: 'Contract address to monitor'
        },
        event_name: {
          type: 'string',
          description: 'Specific event to filter (optional, returns all if not specified)'
        },
        from_block: {
          type: 'string',
          description: 'Starting block number or "latest-1000"'
        },
        to_block: {
          type: 'string',
          description: 'Ending block number or "latest"'
        },
        limit: {
          type: 'number',
          description: 'Maximum events to return - default: 100'
        }
      },
      required: ['contract_address']
    }
  }
}

// Estimate gas optimized
export const estimateGasOptimized: Web3Tool = {
  type: 'function',
  function: {
    name: 'estimate_gas_optimized',
    description: 'Estimate gas cost and suggest optimal gas price and timing for transaction',
    parameters: {
      type: 'object',
      properties: {
        transaction_type: {
          type: 'string',
          description: 'Type of transaction (transfer, swap, mint, contract_call)'
        },
        urgency: {
          type: 'string',
          description: 'Transaction urgency (low, medium, high) - default: medium'
        },
        target_time: {
          type: 'number',
          description: 'Target confirmation time in minutes - default: 5'
        }
      },
      required: []
    }
  },
  implemented: true
}

// Scan contract vulnerabilities
export const scanContractVulnerabilities: Web3Tool = {
  type: 'function',
  function: {
    name: 'scan_contract_vulnerabilities',
    description: 'Scan smart contract for common vulnerabilities and security issues',
    parameters: {
      type: 'object',
      properties: {
        contract_address: {
          type: 'string',
          description: 'Contract address to scan'
        },
        scan_type: {
          type: 'string',
          description: 'Scan depth (quick, standard, deep) - default: standard'
        },
        include_recommendations: {
          type: 'boolean',
          description: 'Include security recommendations - default: true'
        }
      },
      required: ['contract_address']
    }
  }
}

// ========================================
// PHASE 3: NFT & STAKING TOOLS
// ========================================

// Get NFT floor price
export const getNFTFloorPrice: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_nft_floor_price',
    description: 'Get current floor price for an NFT collection across multiple marketplaces',
    parameters: {
      type: 'object',
      properties: {
        collection_address: {
          type: 'string',
          description: 'NFT collection contract address'
        },
        marketplace: {
          type: 'string',
          description: 'Marketplace (opensea, blur, looksrare, magiceden, all) - default: all'
        }
      },
      required: ['collection_address']
    }
  }
}

// Get NFT metadata
export const getNFTMetadata: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_nft_metadata',
    description: 'Get detailed metadata for a specific NFT including traits and rarity',
    parameters: {
      type: 'object',
      properties: {
        contract_address: {
          type: 'string',
          description: 'NFT contract address'
        },
        token_id: {
          type: 'string',
          description: 'Token ID'
        },
        include_traits: {
          type: 'boolean',
          description: 'Include trait rarity analysis - default: true'
        }
      },
      required: ['contract_address', 'token_id']
    }
  }
}

// Get collection stats
export const getCollectionStats: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_collection_stats',
    description: 'Get NFT collection statistics including volume, holders, floor price, and sales',
    parameters: {
      type: 'object',
      properties: {
        collection_address: {
          type: 'string',
          description: 'Collection contract address'
        },
        timeframe: {
          type: 'string',
          description: 'Timeframe (24h, 7d, 30d, all) - default: 24h'
        }
      },
      required: ['collection_address']
    }
  }
}

// Stake tokens
export const stakeTokens: Web3Tool = {
  type: 'function',
  function: {
    name: 'stake_tokens',
    description: 'Stake tokens in a staking contract to earn rewards',
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'Token to stake'
        },
        amount: {
          type: 'string',
          description: 'Amount to stake'
        },
        staking_contract: {
          type: 'string',
          description: 'Staking contract address'
        },
        lock_period: {
          type: 'number',
          description: 'Lock period in days (if applicable)'
        }
      },
      required: ['token_address', 'amount', 'staking_contract']
    }
  }
}

// Unstake tokens
export const unstakeTokens: Web3Tool = {
  type: 'function',
  function: {
    name: 'unstake_tokens',
    description: 'Unstake tokens and claim rewards from staking contract',
    parameters: {
      type: 'object',
      properties: {
        staking_contract: {
          type: 'string',
          description: 'Staking contract address'
        },
        amount: {
          type: 'string',
          description: 'Amount to unstake (or "all" for 100%)'
        }
      },
      required: ['staking_contract', 'amount']
    }
  }
}

// Get staking rewards
export const getStakingRewards: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_staking_rewards',
    description: 'Get pending staking rewards and APY for a staking position',
    parameters: {
      type: 'object',
      properties: {
        staking_contract: {
          type: 'string',
          description: 'Staking contract address'
        },
        address: {
          type: 'string',
          description: 'Wallet address (defaults to connected wallet)'
        }
      },
      required: ['staking_contract']
    }
  }
}

// Claim rewards
export const claimRewards: Web3Tool = {
  type: 'function',
  function: {
    name: 'claim_rewards',
    description: 'Claim pending staking or farming rewards',
    parameters: {
      type: 'object',
      properties: {
        protocol: {
          type: 'string',
          description: 'Protocol name (aave, compound, curve, custom)'
        },
        contract_address: {
          type: 'string',
          description: 'Reward contract address'
        }
      },
      required: ['contract_address']
    }
  }
}

// ========================================
// PHASE 4: ADVANCED FEATURES
// ========================================

// Bridge assets cross-chain
export const bridgeAssets: Web3Tool = {
  type: 'function',
  function: {
    name: 'bridge_assets',
    description: 'Bridge tokens between different blockchain networks',
    parameters: {
      type: 'object',
      properties: {
        from_chain: {
          type: 'number',
          description: 'Source chain ID'
        },
        to_chain: {
          type: 'number',
          description: 'Destination chain ID'
        },
        token: {
          type: 'string',
          description: 'Token address to bridge'
        },
        amount: {
          type: 'string',
          description: 'Amount to bridge'
        },
        bridge_protocol: {
          type: 'string',
          description: 'Bridge to use (official, wormhole, layerzero, auto) - default: auto'
        }
      },
      required: ['from_chain', 'to_chain', 'token', 'amount']
    }
  }
}

// Get bridge status
export const getBridgeStatus: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_bridge_status',
    description: 'Check status of a cross-chain bridge transaction',
    parameters: {
      type: 'object',
      properties: {
        tx_hash: {
          type: 'string',
          description: 'Source chain transaction hash'
        },
        bridge_protocol: {
          type: 'string',
          description: 'Bridge protocol used'
        }
      },
      required: ['tx_hash', 'bridge_protocol']
    }
  }
}

// Get multichain balance
export const getMultichainBalance: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_multichain_balance',
    description: 'Get token balances across multiple blockchain networks',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Wallet address to check'
        },
        chains: {
          type: 'array',
          description: 'Array of chain IDs to check',
          items: { type: 'number' }
        },
        token_symbol: {
          type: 'string',
          description: 'Token symbol to check (e.g., USDC, USDT)'
        }
      },
      required: ['address']
    }
  },
  implemented: true
}

// Simulate transaction
export const simulateTransaction: Web3Tool = {
  type: 'function',
  function: {
    name: 'simulate_transaction',
    description: 'Simulate transaction before execution to preview outcomes and catch errors',
    parameters: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Contract address'
        },
        data: {
          type: 'string',
          description: 'Transaction data (hex)'
        },
        value: {
          type: 'string',
          description: 'ETH value to send'
        },
        from: {
          type: 'string',
          description: 'Sender address (defaults to connected wallet)'
        }
      },
      required: ['to', 'data']
    }
  }
}

// Get DAO proposals
export const getDAOProposals: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_dao_proposals',
    description: 'Get active governance proposals for a DAO',
    parameters: {
      type: 'object',
      properties: {
        dao_address: {
          type: 'string',
          description: 'DAO contract address or ENS name'
        },
        status: {
          type: 'string',
          description: 'Proposal status (active, pending, executed, all) - default: active'
        },
        limit: {
          type: 'number',
          description: 'Number of proposals to return - default: 20'
        }
      },
      required: ['dao_address']
    }
  },
  implemented: true
}

// Vote on proposal
export const voteOnProposal: Web3Tool = {
  type: 'function',
  function: {
    name: 'vote_on_proposal',
    description: 'Cast vote on a DAO governance proposal',
    parameters: {
      type: 'object',
      properties: {
        proposal_id: {
          type: 'string',
          description: 'Proposal ID to vote on'
        },
        vote: {
          type: 'string',
          description: 'Vote choice (for, against, abstain)'
        },
        dao_address: {
          type: 'string',
          description: 'DAO contract address'
        }
      },
      required: ['proposal_id', 'vote', 'dao_address']
    }
  }
}

// Get voting power
export const getVotingPower: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_voting_power',
    description: 'Get voting power in a DAO for an address',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Wallet address (defaults to connected wallet)'
        },
        dao_address: {
          type: 'string',
          description: 'DAO contract address'
        },
        block_number: {
          type: 'string',
          description: 'Block number for snapshot (optional, uses latest)'
        }
      },
      required: ['dao_address']
    }
  }
}

// Get token allowances
export const getTokenAllowances: Web3Tool = {
  type: 'function',
  function: {
    name: 'get_token_allowances',
    description: 'Get all token approvals for an address to audit security',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Wallet address (defaults to connected wallet)'
        },
        include_revoke_tx: {
          type: 'boolean',
          description: 'Include revoke transaction data - default: true'
        }
      },
      required: []
    }
  }
}

// Revoke token approval
export const revokeApproval: Web3Tool = {
  type: 'function',
  function: {
    name: 'revoke_approval',
    description: 'Revoke token approval for a spender contract',
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'Token contract address'
        },
        spender: {
          type: 'string',
          description: 'Spender contract address to revoke'
        }
      },
      required: ['token_address', 'spender']
    }
  }
}

// All Web3 tools
export const web3Tools: Web3Tool[] = [
  // Original tools (16)
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
  getNetworkStats,
  // Phase 1: DeFi Tools (6)
  swapTokens,
  getTokenPrice,
  getPortfolioValue,
  getPoolInfo,
  addLiquidity,
  removeLiquidity,
  // Phase 2: Security & Analytics (8)
  verifyTokenLegitimacy,
  checkTokenAudit,
  trackWhaleMovements,
  analyzeTokenHolders,
  getPriceHistory,
  getContractEvents,
  estimateGasOptimized,
  scanContractVulnerabilities,
  // Phase 3: NFT & Staking (7)
  getNFTFloorPrice,
  getNFTMetadata,
  getCollectionStats,
  stakeTokens,
  unstakeTokens,
  getStakingRewards,
  claimRewards,
  // Phase 4: Advanced Features (9)
  bridgeAssets,
  getBridgeStatus,
  getMultichainBalance,
  simulateTransaction,
  getDAOProposals,
  voteOnProposal,
  getVotingPower,
  getTokenAllowances,
  revokeApproval
]

// Read-only tools (safe to call without user confirmation)
export const readOnlyTools: Web3Tool[] = [
  // Original read-only
  getWalletAddress,
  getBalance,
  getTokenBalance,
  validateAddress,
  getGasPrice,
  getTransactionHistory,
  getBlockInfo,
  analyzeContract,
  getTokenInfo,
  getNFTHoldings,
  scanAddressRisk,
  getNetworkStats,
  // Phase 1 read-only
  getTokenPrice,
  getPortfolioValue,
  getPoolInfo,
  // Phase 2 read-only
  verifyTokenLegitimacy,
  checkTokenAudit,
  trackWhaleMovements,
  analyzeTokenHolders,
  getPriceHistory,
  getContractEvents,
  estimateGasOptimized,
  scanContractVulnerabilities,
  // Phase 3 read-only
  getNFTFloorPrice,
  getNFTMetadata,
  getCollectionStats,
  getStakingRewards,
  // Phase 4 read-only
  getBridgeStatus,
  getMultichainBalance,
  simulateTransaction,
  getDAOProposals,
  getVotingPower,
  getTokenAllowances
]

// Write tools (require user confirmation)
export const writeTools: Web3Tool[] = [
  // Original write tools
  sendNative,
  sendToken,
  switchChain,
  // Phase 1 write tools
  swapTokens,
  addLiquidity,
  removeLiquidity,
  // Phase 3 write tools
  stakeTokens,
  unstakeTokens,
  claimRewards,
  // Phase 4 write tools
  bridgeAssets,
  voteOnProposal,
  revokeApproval
]

// Analysis tools (blockchain scanning and analysis)
export const analysisTools: Web3Tool[] = [
  getTransactionHistory,
  getBlockInfo,
  analyzeContract,
  getTokenInfo,
  getNFTHoldings,
  scanAddressRisk,
  getNetworkStats
]
