/**
 * Web3 Function Executor
 * Executes Web3 functions called by the LLM
 */

import { WalletState } from '../contexts/Web3Context'
import UsageTracker, { SubscriptionTier } from './usageTracking'
import { accountApi } from './accountApi'

export interface FunctionCall {
  name: string
  arguments: Record<string, any>
}

export interface FunctionResult {
  success: boolean
  result?: any
  error?: string
  usageLimitReached?: boolean
}

export class Web3Executor {
  private wallet: WalletState
  private userTier: SubscriptionTier
  private useTierLimits: boolean

  constructor(wallet: WalletState, userTier: SubscriptionTier = 'free', useTierLimits: boolean = true) {
    this.wallet = wallet
    this.userTier = userTier
    this.useTierLimits = useTierLimits
  }

  async execute(functionCall: FunctionCall): Promise<FunctionResult> {
    // Check usage limit BEFORE executing (if tier limits are enabled)
    if (this.useTierLimits) {
      // Try to get usage from account API, fall back to localStorage
      const canMakeCall = UsageTracker.canMakeCall(this.userTier)
      
      if (!canMakeCall) {
        const usage = UsageTracker.getUsage(this.userTier)
        return {
          success: false,
          error: `Web3 usage limit reached (${usage.used}/${usage.limit} calls this month). Upgrade your tier to continue.`,
          usageLimitReached: true
        }
      }
    }

    if (!this.wallet.connected) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      }
    }

    try {
      switch (functionCall.name) {
        case 'get_wallet_address':
          return this.recordUsageAndReturn(this.getWalletAddress())
        
        case 'get_balance':
          return this.recordUsageAndReturn(this.getBalance())
        
        case 'get_token_balance':
          return this.recordUsageAndReturnAsync(this.getTokenBalance(functionCall.arguments.token_address))
        
        case 'send_native':
          return await this.sendNative(functionCall.arguments.to, functionCall.arguments.amount)
        
        case 'send_token':
          return await this.sendToken(
            functionCall.arguments.token_address,
            functionCall.arguments.to,
            functionCall.arguments.amount
          )
        
        case 'validate_address':
          return this.validateAddress(functionCall.arguments.address)
        
        case 'get_gas_price':
          return await this.getGasPrice()
        
        case 'switch_chain':
          return await this.switchChain(functionCall.arguments.chain_id)
        
        case 'resolve_ens':
          return await this.resolveEns(functionCall.arguments.ens_name)
        
        case 'get_transaction_history':
          return await this.getTransactionHistory(
            functionCall.arguments.address,
            functionCall.arguments.limit
          )
        
        case 'get_block_info':
          return await this.getBlockInfo(functionCall.arguments.block_number)
        
        case 'analyze_contract':
          return await this.analyzeContract(functionCall.arguments.contract_address)
        
        case 'get_token_info':
          return await this.getTokenInfo(functionCall.arguments.token_address)
        
        case 'get_nft_holdings':
          return await this.getNFTHoldings(functionCall.arguments.address)
        
        case 'scan_address_risk':
          return await this.scanAddressRisk(functionCall.arguments.address)
        
        case 'get_network_stats':
          return await this.getNetworkStats()
        
        // DeFi Tools
        case 'swap_tokens':
          return await this.swapTokens(
            functionCall.arguments.from_token,
            functionCall.arguments.to_token,
            functionCall.arguments.amount,
            functionCall.arguments.slippage
          )
        
        case 'get_token_price':
          return await this.getTokenPrice(
            functionCall.arguments.token_address,
            functionCall.arguments.vs_currency
          )
        
        case 'get_portfolio_value':
          return await this.getPortfolioValue(functionCall.arguments.address)
        
        case 'get_pool_info':
          return await this.getPoolInfo(functionCall.arguments.pool_address)
        
        case 'add_liquidity':
          return await this.addLiquidity(
            functionCall.arguments.pool_address,
            functionCall.arguments.token_a_amount,
            functionCall.arguments.token_b_amount
          )
        
        case 'remove_liquidity':
          return await this.removeLiquidity(
            functionCall.arguments.pool_address,
            functionCall.arguments.liquidity_amount
          )
        
        case 'get_price_history':
          return await this.getPriceHistory(
            functionCall.arguments.token_address,
            functionCall.arguments.days
          )
        
        case 'simulate_transaction':
          return await this.simulateTransaction(functionCall.arguments.transaction_data)
        
        case 'estimate_gas_optimized':
          return await this.estimateGasOptimized(functionCall.arguments.transaction_data)
        
        // Security & Analysis Tools
        case 'verify_token_legitimacy':
          return await this.verifyTokenLegitimacy(functionCall.arguments.token_address)
        
        case 'check_token_audit':
          return await this.checkTokenAudit(functionCall.arguments.token_address)
        
        case 'track_whale_movements':
          return await this.trackWhaleMovements(functionCall.arguments.min_value_usd)
        
        case 'analyze_token_holders':
          return await this.analyzeTokenHolders(functionCall.arguments.token_address)
        
        case 'get_contract_events':
          return await this.getContractEvents(
            functionCall.arguments.contract_address,
            functionCall.arguments.event_name,
            functionCall.arguments.from_block
          )
        
        case 'scan_contract_vulnerabilities':
          return await this.scanContractVulnerabilities(functionCall.arguments.contract_address)
        
        // NFT Tools
        case 'get_nft_floor_price':
          return await this.getNFTFloorPrice(functionCall.arguments.collection_address)
        
        case 'get_nft_metadata':
          return await this.getNFTMetadata(
            functionCall.arguments.collection_address,
            functionCall.arguments.token_id
          )
        
        case 'get_collection_stats':
          return await this.getCollectionStats(functionCall.arguments.collection_address)
        
        // Staking Tools
        case 'stake_tokens':
          return await this.stakeTokens(
            functionCall.arguments.staking_contract,
            functionCall.arguments.amount
          )
        
        case 'unstake_tokens':
          return await this.unstakeTokens(
            functionCall.arguments.staking_contract,
            functionCall.arguments.amount
          )
        
        case 'get_staking_rewards':
          return await this.getStakingRewards(functionCall.arguments.staking_contract)
        
        case 'claim_rewards':
          return await this.claimRewards(functionCall.arguments.staking_contract)
        
        // Cross-Chain Tools
        case 'bridge_assets':
          return await this.bridgeAssets(
            functionCall.arguments.from_chain,
            functionCall.arguments.to_chain,
            functionCall.arguments.token_address,
            functionCall.arguments.amount
          )
        
        case 'get_bridge_status':
          return await this.getBridgeStatus(functionCall.arguments.transaction_hash)
        
        case 'get_multichain_balance':
          return await this.getMultichainBalance(functionCall.arguments.address)
        
        // DAO / Governance Tools
        case 'get_dao_proposals':
          return await this.getDAOProposals(functionCall.arguments.dao_address)
        
        case 'vote_on_proposal':
          return await this.voteOnProposal(
            functionCall.arguments.dao_address,
            functionCall.arguments.proposal_id,
            functionCall.arguments.support
          )
        
        case 'delegate_votes':
          return await this.delegateVotes(
            functionCall.arguments.token_address,
            functionCall.arguments.delegate_address
          )
        
        case 'create_proposal':
          return await this.createProposal(
            functionCall.arguments.dao_address,
            functionCall.arguments.title,
            functionCall.arguments.description,
            functionCall.arguments.actions
          )
        
        case 'execute_proposal':
          return await this.executeProposal(
            functionCall.arguments.dao_address,
            functionCall.arguments.proposal_id
          )
        
        case 'get_voting_power':
          return await this.getVotingPower(
            functionCall.arguments.token_address,
            functionCall.arguments.address
          )
        
        default:
          return {
            success: false,
            error: `Unknown function: ${functionCall.name}`
          }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Function execution failed'
      }
    }
  }

  private getWalletAddress(): FunctionResult {
    return {
      success: true,
      result: {
        address: this.wallet.address,
        wallet_type: this.wallet.walletType,
        chain: this.wallet.chainName
      }
    }
  }

  private getBalance(): FunctionResult {
    const currency = this.wallet.walletType === 'phantom' ? 'SOL' : 
                     this.wallet.walletType === 'tronlink' ? 'TRX' : 'ETH'
    
    return {
      success: true,
      result: {
        balance: this.wallet.balance,
        currency,
        address: this.wallet.address
      }
    }
  }

  private async getTokenBalance(tokenAddress: string): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Token balance queries are only supported on EVM chains (MetaMask)'
      }
    }

    try {
      const ethereum = (window as any).ethereum
      
      // ERC-20 balanceOf function signature
      const data = '0x70a08231' + this.wallet.address?.slice(2).padStart(64, '0')
      
      const balance = await ethereum.request({
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: data
        }, 'latest']
      })

      const balanceDecimal = parseInt(balance, 16) / 1e18

      return {
        success: true,
        result: {
          balance: balanceDecimal.toFixed(4),
          token_address: tokenAddress,
          wallet_address: this.wallet.address
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get token balance: ${error.message}`
      }
    }
  }

  private async sendNative(to: string, amount: string): Promise<FunctionResult> {
    try {
      if (this.wallet.walletType === 'metamask') {
        const ethereum = (window as any).ethereum
        const amountWei = '0x' + (parseFloat(amount) * 1e18).toString(16)
        
        const txHash = await ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: this.wallet.address,
            to: to,
            value: amountWei
          }]
        })

        return {
          success: true,
          result: {
            transaction_hash: txHash,
            from: this.wallet.address,
            to: to,
            amount: amount,
            currency: 'ETH'
          }
        }
      } else if (this.wallet.walletType === 'phantom') {
        return {
          success: false,
          error: 'Solana transfers not yet implemented'
        }
      } else if (this.wallet.walletType === 'tronlink') {
        return {
          success: false,
          error: 'Tron transfers not yet implemented'
        }
      }

      return {
        success: false,
        error: 'Unsupported wallet type'
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Transaction failed: ${error.message}`
      }
    }
  }

  private async sendToken(tokenAddress: string, to: string, amount: string): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Token transfers are only supported on EVM chains (MetaMask)'
      }
    }

    try {
      const ethereum = (window as any).ethereum
      const amountWei = '0x' + (parseFloat(amount) * 1e18).toString(16)
      
      // ERC-20 transfer function signature
      const data = '0xa9059cbb' + 
                   to.slice(2).padStart(64, '0') + 
                   amountWei.slice(2).padStart(64, '0')
      
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: this.wallet.address,
          to: tokenAddress,
          data: data
        }]
      })

      return {
        success: true,
        result: {
          transaction_hash: txHash,
          from: this.wallet.address,
          to: to,
          amount: amount,
          token_address: tokenAddress
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Token transfer failed: ${error.message}`
      }
    }
  }

  private validateAddress(address: string): FunctionResult {
    let isValid = false
    let addressType = 'unknown'

    // Ethereum address validation
    if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
      isValid = true
      addressType = 'ethereum'
    }
    // Solana address validation (base58, 32-44 chars)
    else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
      isValid = true
      addressType = 'solana'
    }
    // Tron address validation (starts with T, 34 chars)
    else if (/^T[a-zA-Z0-9]{33}$/.test(address)) {
      isValid = true
      addressType = 'tron'
    }

    return {
      success: true,
      result: {
        valid: isValid,
        address_type: addressType,
        address: address
      }
    }
  }

  private async getGasPrice(): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Gas price queries are only supported on EVM chains (MetaMask)'
      }
    }

    try {
      const ethereum = (window as any).ethereum
      const gasPrice = await ethereum.request({ method: 'eth_gasPrice' })
      const gasPriceGwei = parseInt(gasPrice, 16) / 1e9

      return {
        success: true,
        result: {
          gas_price_gwei: gasPriceGwei.toFixed(2),
          gas_price_wei: parseInt(gasPrice, 16),
          chain: this.wallet.chainName
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get gas price: ${error.message}`
      }
    }
  }

  private async switchChain(chainId: number): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Chain switching is only supported on MetaMask'
      }
    }

    try {
      const ethereum = (window as any).ethereum
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + chainId.toString(16) }]
      })

      return {
        success: true,
        result: {
          chain_id: chainId,
          message: 'Chain switched successfully'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to switch chain: ${error.message}`
      }
    }
  }

  private async resolveEns(ensName: string): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'ENS resolution is only supported on Ethereum (MetaMask)'
      }
    }

    try {
      // This is a simplified version - in production, use a proper ENS library
      return {
        success: false,
        error: 'ENS resolution not yet implemented. Use a direct address instead.'
      }
    } catch (error: any) {
      return {
        success: false,
        error: `ENS resolution failed: ${error.message}`
      }
    }
  }

  private async getTransactionHistory(address?: string, limit: number = 10): Promise<FunctionResult> {
    const targetAddress = address || this.wallet.address

    if (!targetAddress) {
      return {
        success: false,
        error: 'No address provided and wallet not connected'
      }
    }

    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Transaction history is currently only supported on Ethereum (MetaMask)'
      }
    }

    try {
      const ethereum = (window as any).ethereum
      
      // Get recent blocks and scan for transactions
      const currentBlock = await ethereum.request({ method: 'eth_blockNumber' })
      const blockNumber = parseInt(currentBlock, 16)
      
      const transactions = []
      const blocksToScan = Math.min(limit * 10, 100) // Scan up to 100 blocks
      
      for (let i = 0; i < blocksToScan && transactions.length < limit; i++) {
        const block = await ethereum.request({
          method: 'eth_getBlockByNumber',
          params: [`0x${(blockNumber - i).toString(16)}`, true]
        })
        
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (tx.from?.toLowerCase() === targetAddress.toLowerCase() ||
                tx.to?.toLowerCase() === targetAddress.toLowerCase()) {
              transactions.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: parseInt(tx.value, 16) / 1e18 + ' ETH',
                block: parseInt(tx.blockNumber, 16),
                timestamp: new Date(parseInt(block.timestamp, 16) * 1000).toISOString()
              })
              
              if (transactions.length >= limit) break
            }
          }
        }
      }

      return {
        success: true,
        result: {
          address: targetAddress,
          transactions,
          count: transactions.length
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get transaction history: ${error.message}`
      }
    }
  }

  private async getBlockInfo(blockNumber: string): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Block info is currently only supported on Ethereum (MetaMask)'
      }
    }

    try {
      const ethereum = (window as any).ethereum
      const block = await ethereum.request({
        method: 'eth_getBlockByNumber',
        params: [blockNumber === 'latest' ? 'latest' : `0x${parseInt(blockNumber).toString(16)}`, true]
      })

      if (!block) {
        return {
          success: false,
          error: 'Block not found'
        }
      }

      return {
        success: true,
        result: {
          number: parseInt(block.number, 16),
          hash: block.hash,
          timestamp: new Date(parseInt(block.timestamp, 16) * 1000).toISOString(),
          transactions: block.transactions.length,
          miner: block.miner,
          gasUsed: parseInt(block.gasUsed, 16),
          gasLimit: parseInt(block.gasLimit, 16)
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get block info: ${error.message}`
      }
    }
  }

  private async analyzeContract(contractAddress: string): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Contract analysis is currently only supported on Ethereum (MetaMask)'
      }
    }

    try {
      const ethereum = (window as any).ethereum
      
      // Get contract code
      const code = await ethereum.request({
        method: 'eth_getCode',
        params: [contractAddress, 'latest']
      })

      const isContract = code && code !== '0x'

      if (!isContract) {
        return {
          success: true,
          result: {
            address: contractAddress,
            is_contract: false,
            type: 'EOA (Externally Owned Account)'
          }
        }
      }

      return {
        success: true,
        result: {
          address: contractAddress,
          is_contract: true,
          type: 'Smart Contract',
          code_size: (code.length - 2) / 2 + ' bytes',
          note: 'Contract detected. Use Etherscan for detailed verification and source code.'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to analyze contract: ${error.message}`
      }
    }
  }

  private async getTokenInfo(tokenAddress: string): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Token info is currently only supported on Ethereum (MetaMask)'
      }
    }

    try {
      const ethereum = (window as any).ethereum
      
      // ERC-20 function signatures
      const nameSignature = '0x06fdde03' // name()
      const symbolSignature = '0x95d89b41' // symbol()
      const decimalsSignature = '0x313ce567' // decimals()
      const totalSupplySignature = '0x18160ddd' // totalSupply()

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        ethereum.request({
          method: 'eth_call',
          params: [{ to: tokenAddress, data: nameSignature }, 'latest']
        }),
        ethereum.request({
          method: 'eth_call',
          params: [{ to: tokenAddress, data: symbolSignature }, 'latest']
        }),
        ethereum.request({
          method: 'eth_call',
          params: [{ to: tokenAddress, data: decimalsSignature }, 'latest']
        }),
        ethereum.request({
          method: 'eth_call',
          params: [{ to: tokenAddress, data: totalSupplySignature }, 'latest']
        })
      ])

      return {
        success: true,
        result: {
          address: tokenAddress,
          name: this.decodeString(name),
          symbol: this.decodeString(symbol),
          decimals: parseInt(decimals, 16),
          totalSupply: parseInt(totalSupply, 16)
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get token info: ${error.message}`
      }
    }
  }

  private async getNFTHoldings(address?: string): Promise<FunctionResult> {
    const targetAddress = address || this.wallet.address

    return {
      success: false,
      error: 'NFT holdings require an external API (Alchemy, Moralis, etc.). Not yet implemented.'
    }
  }

  private async scanAddressRisk(address: string): Promise<FunctionResult> {
    // Basic heuristic checks - in production, use services like Chainalysis, TRM Labs, etc.
    
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Address risk scanning is currently only supported on Ethereum (MetaMask)'
      }
    }

    try {
      const ethereum = (window as any).ethereum
      
      // Check if it's a contract
      const code = await ethereum.request({
        method: 'eth_getCode',
        params: [address, 'latest']
      })

      const isContract = code && code !== '0x'
      
      // Get balance
      const balanceHex = await ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })
      const balance = parseInt(balanceHex, 16) / 1e18

      // Basic risk assessment
      const risks = []
      if (isContract) {
        risks.push('Address is a smart contract - verify before interacting')
      }
      if (balance === 0 && !isContract) {
        risks.push('Address has zero balance - may be inactive or new')
      }

      return {
        success: true,
        result: {
          address,
          is_contract: isContract,
          balance: balance + ' ETH',
          risk_level: risks.length > 0 ? 'Medium' : 'Low',
          risks: risks.length > 0 ? risks : ['No obvious risks detected'],
          note: 'This is a basic scan. For comprehensive risk analysis, use professional services like Chainalysis or TRM Labs.'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to scan address: ${error.message}`
      }
    }
  }

  private async getNetworkStats(): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Network stats are currently only supported on Ethereum (MetaMask)'
      }
    }

    try {
      const ethereum = (window as any).ethereum
      
      const [blockNumber, gasPrice, chainId] = await Promise.all([
        ethereum.request({ method: 'eth_blockNumber' }),
        ethereum.request({ method: 'eth_gasPrice' }),
        ethereum.request({ method: 'eth_chainId' })
      ])

      return {
        success: true,
        result: {
          chain_id: parseInt(chainId, 16),
          chain_name: this.wallet.chainName,
          current_block: parseInt(blockNumber, 16),
          gas_price: parseInt(gasPrice, 16) / 1e9 + ' Gwei',
          network: this.wallet.walletType
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get network stats: ${error.message}`
      }
    }
  }

  // ========================================
  // DEFI TOOLS
  // ========================================

  private async swapTokens(fromToken: string, toToken: string, amount: string, slippage: number = 0.5): Promise<FunctionResult> {
    // Note: This requires DEX aggregator API integration (1inch, 0x, Jupiter, etc.)
    return {
      success: false,
      error: 'Token swaps require DEX aggregator integration. Use 1inch, 0x Protocol, or Jupiter Aggregator APIs.'
    }
  }

  private async getTokenPrice(tokenAddress: string, vsCurrency: string = 'usd'): Promise<FunctionResult> {
    try {
      // Using CoinGecko's public API (no key required)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokenAddress}&vs_currencies=${vsCurrency}&include_24hr_change=true`
      )
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data = await response.json()
      const priceData = data[tokenAddress.toLowerCase()]
      
      if (!priceData) {
        return {
          success: false,
          error: 'Token not found on CoinGecko. It may be too new or not listed.'
        }
      }

      return {
        success: true,
        result: {
          token_address: tokenAddress,
          price: priceData[vsCurrency],
          currency: vsCurrency.toUpperCase(),
          change_24h: priceData[`${vsCurrency}_24h_change`] || null,
          source: 'CoinGecko'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get token price: ${error.message}`
      }
    }
  }

  private async getPortfolioValue(address: string): Promise<FunctionResult> {
    try {
      // Using Covalent free API
      const response = await fetch(
        `https://api.covalenthq.com/v1/eth-mainnet/address/${address}/balances_v2/?key=cqt_rQfg6GQx3hgQGdqCkgVgwMqYVGcW`
      )
      
      if (!response.ok) {
        throw new Error(`Covalent API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.data || !data.data.items) {
        return {
          success: false,
          error: 'Unable to fetch portfolio data'
        }
      }

      let totalValue = 0
      const tokens = data.data.items.map((item: any) => {
        const value = item.quote || 0
        totalValue += value
        return {
          symbol: item.contract_ticker_symbol,
          balance: item.balance / Math.pow(10, item.contract_decimals),
          value_usd: value,
          contract_address: item.contract_address
        }
      }).filter((t: any) => t.value_usd > 0)

      return {
        success: true,
        result: {
          address,
          total_value_usd: totalValue.toFixed(2),
          token_count: tokens.length,
          tokens: tokens.slice(0, 20), // Top 20 by value
          source: 'Covalent'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to calculate portfolio value: ${error.message}`
      }
    }
  }

  private async getPoolInfo(poolAddress: string): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Pool info is currently only supported on Ethereum (MetaMask)'
      }
    }

    try {
      // Uniswap V2 Pool ABI (minimal)
      const poolABI = [
        'function token0() view returns (address)',
        'function token1() view returns (address)',
        'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'
      ]

      const { ethers } = await import('ethers')
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const pool = new ethers.Contract(poolAddress, poolABI, provider)

      const [token0, token1, reserves] = await Promise.all([
        pool.token0(),
        pool.token1(),
        pool.getReserves()
      ])

      return {
        success: true,
        result: {
          pool_address: poolAddress,
          token0_address: token0,
          token1_address: token1,
          token0_reserve: reserves[0].toString(),
          token1_reserve: reserves[1].toString(),
          last_update: new Date(Number(reserves[2]) * 1000).toISOString()
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get pool info: ${error.message}`
      }
    }
  }

  private async addLiquidity(poolAddress: string, tokenAAmount: string, tokenBAmount: string): Promise<FunctionResult> {
    return {
      success: false,
      error: 'Adding liquidity requires router contract integration and token approvals. Use Uniswap, PancakeSwap, or Raydium SDKs.'
    }
  }

  private async removeLiquidity(poolAddress: string, liquidityAmount: string): Promise<FunctionResult> {
    return {
      success: false,
      error: 'Removing liquidity requires router contract integration. Use Uniswap, PancakeSwap, or Raydium SDKs.'
    }
  }

  private async getPriceHistory(tokenAddress: string, days: number = 30): Promise<FunctionResult> {
    try {
      // Using CoinGecko public API
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/ethereum/contract/${tokenAddress}/market_chart/?vs_currency=usd&days=${days}`
      )
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        result: {
          token_address: tokenAddress,
          days: days,
          prices: data.prices.map((p: any) => ({
            timestamp: p[0],
            date: new Date(p[0]).toISOString(),
            price: p[1]
          })),
          total_data_points: data.prices.length,
          source: 'CoinGecko'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get price history: ${error.message}`
      }
    }
  }

  private async simulateTransaction(transactionData: any): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Transaction simulation is currently only supported on Ethereum'
      }
    }

    try {
      const ethereum = (window as any).ethereum
      
      // Use eth_call to simulate without sending
      const result = await ethereum.request({
        method: 'eth_call',
        params: [transactionData, 'latest']
      })

      return {
        success: true,
        result: {
          simulation_result: result,
          will_succeed: true,
          note: 'Simulation successful. Transaction should execute without errors.'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Transaction simulation failed: ${error.message}. Transaction would likely revert.`
      }
    }
  }

  private async estimateGasOptimized(transactionData: any): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Gas estimation is currently only supported on Ethereum'
      }
    }

    try {
      const ethereum = (window as any).ethereum
      
      const gasEstimate = await ethereum.request({
        method: 'eth_estimateGas',
        params: [transactionData]
      })

      const gasPrice = await ethereum.request({
        method: 'eth_gasPrice'
      })

      const estimatedGas = parseInt(gasEstimate, 16)
      const gasPriceWei = parseInt(gasPrice, 16)
      const estimatedCost = (estimatedGas * gasPriceWei) / 1e18

      return {
        success: true,
        result: {
          gas_estimate: estimatedGas,
          gas_price_gwei: gasPriceWei / 1e9,
          estimated_cost_eth: estimatedCost.toFixed(6),
          note: 'Add 10-20% buffer for gas limit to ensure transaction success'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to estimate gas: ${error.message}`
      }
    }
  }

  // ========================================
  // SECURITY & ANALYSIS TOOLS
  // ========================================

  private async verifyTokenLegitimacy(tokenAddress: string): Promise<FunctionResult> {
    return {
      success: false,
      error: 'Token legitimacy verification requires integration with security APIs like CertiK, PeckShield, or Honeypot.is.'
    }
  }

  private async checkTokenAudit(tokenAddress: string): Promise<FunctionResult> {
    return {
      success: false,
      error: 'Token audit checking requires integration with CertiK, Hacken, or similar audit database APIs.'
    }
  }

  private async trackWhaleMovements(minValueUsd: number = 100000): Promise<FunctionResult> {
    return {
      success: false,
      error: 'Whale tracking requires integration with Whale Alert, Nansen, or similar blockchain analytics APIs.'
    }
  }

  private async analyzeTokenHolders(tokenAddress: string): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Token holder analysis is currently only supported on Ethereum'
      }
    }

    return {
      success: false,
      error: 'Token holder analysis requires integration with Etherscan, Dune Analytics, or The Graph APIs.'
    }
  }

  private async getContractEvents(contractAddress: string, eventName?: string, fromBlock?: string): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Contract events are currently only supported on Ethereum'
      }
    }

    try {
      const ethereum = (window as any).ethereum
      const { ethers } = await import('ethers')
      
      // Get logs for the contract
      const filter = {
        address: contractAddress,
        fromBlock: fromBlock || 'latest',
        toBlock: 'latest'
      }

      const provider = new ethers.BrowserProvider(ethereum)
      const logs = await provider.getLogs(filter)

      return {
        success: true,
        result: {
          contract_address: contractAddress,
          events_found: logs.length,
          events: logs.slice(0, 10).map(log => ({
            block_number: log.blockNumber,
            transaction_hash: log.transactionHash,
            topics: log.topics,
            data: log.data
          })),
          note: logs.length > 10 ? `Showing first 10 of ${logs.length} events` : 'All events shown'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get contract events: ${error.message}`
      }
    }
  }

  private async scanContractVulnerabilities(contractAddress: string): Promise<FunctionResult> {
    return {
      success: false,
      error: 'Contract vulnerability scanning requires integration with MythX, Slither, or similar smart contract security analysis tools.'
    }
  }

  // ========================================
  // NFT TOOLS
  // ========================================

  private async getNFTFloorPrice(collectionAddress: string): Promise<FunctionResult> {
    try {
      // Using Reservoir API (public, no key for basic requests)
      const response = await fetch(
        `https://api.reservoir.tools/collections/v7?id=${collectionAddress}`
      )
      
      if (!response.ok) {
        throw new Error(`Reservoir API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.collections || data.collections.length === 0) {
        return {
          success: false,
          error: 'Collection not found. Verify the contract address.'
        }
      }

      const collection = data.collections[0]
      
      return {
        success: true,
        result: {
          collection_address: collectionAddress,
          collection_name: collection.name,
          floor_price_eth: collection.floorAsk?.price?.amount?.native || 'N/A',
          floor_price_usd: collection.floorAsk?.price?.amount?.usd || 'N/A',
          volume_24h: collection.volume?.['1day'] || 0,
          total_supply: collection.tokenCount || 'Unknown',
          source: 'Reservoir'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get NFT floor price: ${error.message}`
      }
    }
  }

  private async getNFTMetadata(collectionAddress: string, tokenId: string): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'NFT metadata is currently only supported on Ethereum'
      }
    }

    try {
      const { ethers } = await import('ethers')
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      
      // ERC-721 minimal ABI
      const nftABI = [
        'function tokenURI(uint256 tokenId) view returns (string)',
        'function name() view returns (string)',
        'function symbol() view returns (string)'
      ]

      const contract = new ethers.Contract(collectionAddress, nftABI, provider)
      
      const [tokenURI, name, symbol] = await Promise.all([
        contract.tokenURI(tokenId),
        contract.name(),
        contract.symbol()
      ])

      // Fetch metadata from URI if it's an HTTP URL
      let metadata = null
      if (tokenURI.startsWith('http')) {
        try {
          const response = await fetch(tokenURI)
          metadata = await response.json()
        } catch (e) {
          // Metadata fetch failed, continue with what we have
        }
      }

      return {
        success: true,
        result: {
          collection_name: name,
          collection_symbol: symbol,
          token_id: tokenId,
          token_uri: tokenURI,
          metadata: metadata || { note: 'Metadata not fetched. URI may be IPFS or invalid.' }
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get NFT metadata: ${error.message}`
      }
    }
  }

  private async getCollectionStats(collectionAddress: string): Promise<FunctionResult> {
    try {
      // Using Reservoir API for collection statistics
      const response = await fetch(
        `https://api.reservoir.tools/collections/v7?id=${collectionAddress}`
      )
      
      if (!response.ok) {
        throw new Error(`Reservoir API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.collections || data.collections.length === 0) {
        return {
          success: false,
          error: 'Collection not found.'
        }
      }

      const c = data.collections[0]
      
      return {
        success: true,
        result: {
          collection_address: collectionAddress,
          name: c.name,
          symbol: c.symbol,
          floor_price_eth: c.floorAsk?.price?.amount?.native || 'N/A',
          floor_price_usd: c.floorAsk?.price?.amount?.usd || 'N/A',
          total_volume: c.volume?.allTime || 0,
          volume_1day: c.volume?.['1day'] || 0,
          volume_7day: c.volume?.['7day'] || 0,
          volume_30day: c.volume?.['30day'] || 0,
          total_supply: c.tokenCount || 'Unknown',
          owner_count: c.ownerCount || 'Unknown',
          source: 'Reservoir'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get collection stats: ${error.message}`
      }
    }
  }

  // ========================================
  // STAKING TOOLS
  // ========================================

  private async stakeTokens(stakingContract: string, amount: string): Promise<FunctionResult> {
    return {
      success: false,
      error: 'Staking requires integration with specific staking contract ABIs and token approvals. Each protocol (Lido, Rocket Pool, etc.) has different interfaces.'
    }
  }

  private async unstakeTokens(stakingContract: string, amount: string): Promise<FunctionResult> {
    return {
      success: false,
      error: 'Unstaking requires integration with specific staking contract ABIs. Each protocol has different unstaking mechanisms and lock periods.'
    }
  }

  private async getStakingRewards(stakingContract: string): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Staking rewards are currently only supported on Ethereum'
      }
    }

    return {
      success: false,
      error: 'Getting staking rewards requires the specific staking contract ABI. Different protocols (Curve, Convex, etc.) use different reward mechanisms.'
    }
  }

  private async claimRewards(stakingContract: string): Promise<FunctionResult> {
    return {
      success: false,
      error: 'Claiming rewards requires the specific staking contract ABI and varies by protocol.'
    }
  }

  // ========================================
  // CROSS-CHAIN TOOLS
  // ========================================

  private async bridgeAssets(fromChain: string, toChain: string, tokenAddress: string, amount: string): Promise<FunctionResult> {
    return {
      success: false,
      error: 'Cross-chain bridging requires integration with bridge protocols like LayerZero, Wormhole, Axelar, or Synapse.'
    }
  }

  private async getBridgeStatus(transactionHash: string): Promise<FunctionResult> {
    return {
      success: false,
      error: 'Bridge status tracking requires integration with bridge APIs (LayerZero, Wormhole, etc.) to monitor cross-chain transactions.'
    }
  }

  private async getMultichainBalance(address: string): Promise<FunctionResult> {
    try {
      // Query multiple chains using Covalent
      const chains = ['eth-mainnet', 'matic-mainnet', 'bsc-mainnet', 'arbitrum-mainnet', 'optimism-mainnet']
      const apiKey = 'cqt_rQfg6GQx3hgQGdqCkgVgwMqYVGcW'
      
      const promises = chains.map(chain =>
        fetch(`https://api.covalenthq.com/v1/${chain}/address/${address}/balances_v2/?key=${apiKey}`)
          .then(r => r.json())
          .then(d => ({ chain, data: d }))
          .catch(() => ({ chain, data: null }))
      )

      const results = await Promise.all(promises)
      
      const balances = results.map(({ chain, data }) => {
        if (!data?.data?.items) return { chain, total_value_usd: 0, tokens: [] }
        
        let total = 0
        const tokens = data.data.items
          .filter((item: any) => (item.quote || 0) > 1) // Only show tokens worth > $1
          .map((item: any) => {
            total += item.quote || 0
            return {
              symbol: item.contract_ticker_symbol,
              value_usd: item.quote
            }
          })
        
        return { chain, total_value_usd: total, token_count: tokens.length }
      })

      const grandTotal = balances.reduce((sum, b) => sum + b.total_value_usd, 0)

      return {
        success: true,
        result: {
          address,
          total_value_usd: grandTotal.toFixed(2),
          chains_queried: chains.length,
          balances,
          source: 'Covalent'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get multichain balance: ${error.message}`
      }
    }
  }

  // ========================================
  // DAO / GOVERNANCE TOOLS
  // ========================================

  private async getDAOProposals(daoAddress: string): Promise<FunctionResult> {
    try {
      // Using Snapshot GraphQL API
      const query = `
        query Proposals($space: String!) {
          proposals(first: 20, where: { space: $space }, orderBy: "created", orderDirection: desc) {
            id
            title
            body
            choices
            start
            end
            state
            scores
            scores_total
          }
        }
      `
      
      const response = await fetch('https://hub.snapshot.org/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { space: daoAddress }
        })
      })

      const data = await response.json()
      
      if (!data.data?.proposals || data.data.proposals.length === 0) {
        return {
          success: false,
          error: 'No proposals found. This might not be a valid Snapshot space ID.'
        }
      }

      return {
        success: true,
        result: {
          dao: daoAddress,
          proposal_count: data.data.proposals.length,
          proposals: data.data.proposals.map((p: any) => ({
            id: p.id,
            title: p.title,
            state: p.state,
            start: new Date(p.start * 1000).toISOString(),
            end: new Date(p.end * 1000).toISOString(),
            choices: p.choices,
            total_votes: p.scores_total
          })),
          source: 'Snapshot'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get DAO proposals: ${error.message}`
      }
    }
  }

  private async voteOnProposal(daoAddress: string, proposalId: string, support: boolean): Promise<FunctionResult> {
    return {
      success: false,
      error: 'Voting requires integration with specific DAO governance contracts. Each DAO uses different voting mechanisms (Snapshot, Governor Alpha/Bravo, etc.).'
    }
  }

  private async delegateVotes(tokenAddress: string, delegateAddress: string): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Vote delegation is currently only supported on Ethereum'
      }
    }

    return {
      success: false,
      error: 'Vote delegation requires the governance token contract ABI and delegate() function. Different tokens implement this differently.'
    }
  }

  private async createProposal(daoAddress: string, title: string, description: string, actions: any[]): Promise<FunctionResult> {
    return {
      success: false,
      error: 'Creating proposals requires integration with DAO governance contracts and often requires minimum token holdings or voting power.'
    }
  }

  private async executeProposal(daoAddress: string, proposalId: string): Promise<FunctionResult> {
    return {
      success: false,
      error: 'Executing proposals requires the DAO governance contract ABI and the proposal must have passed and be ready for execution.'
    }
  }

  private async getVotingPower(tokenAddress: string, address: string): Promise<FunctionResult> {
    if (this.wallet.walletType !== 'metamask') {
      return {
        success: false,
        error: 'Voting power is currently only supported on Ethereum'
      }
    }

    try {
      const { ethers } = await import('ethers')
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      
      // Common governance token ABI
      const govTokenABI = [
        'function getVotes(address account) view returns (uint256)',
        'function balanceOf(address account) view returns (uint256)',
        'function delegates(address account) view returns (address)'
      ]

      const contract = new ethers.Contract(tokenAddress, govTokenABI, provider)
      
      try {
        const [votes, balance, delegate] = await Promise.all([
          contract.getVotes(address),
          contract.balanceOf(address),
          contract.delegates(address)
        ])

        return {
          success: true,
          result: {
            address,
            voting_power: votes.toString(),
            token_balance: balance.toString(),
            delegated_to: delegate,
            is_self_delegated: delegate.toLowerCase() === address.toLowerCase()
          }
        }
      } catch (e) {
        // Fallback if getVotes not available - just return balance
        const balance = await contract.balanceOf(address)
        return {
          success: true,
          result: {
            address,
            token_balance: balance.toString(),
            note: 'This token may not support vote delegation. Showing token balance only.'
          }
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get voting power: ${error.message}`
      }
    }
  }

  // Helper function to decode string from contract call
  private decodeString(hex: string): string {
    try {
      // Remove 0x prefix and decode
      const cleaned = hex.slice(2)
      const length = parseInt(cleaned.slice(64, 128), 16)
      const data = cleaned.slice(128, 128 + length * 2)
      return Buffer.from(data, 'hex').toString('utf8')
    } catch {
      return 'Unknown'
    }
  }

  /**
   * Helper to record usage and return synchronous result
   */
  private recordUsageAndReturn(result: FunctionResult): FunctionResult {
    if (result.success && this.useTierLimits) {
      // Record in localStorage (instant feedback)
      UsageTracker.recordCall(this.userTier)
      
      // Also record to account API (async, don't wait)
      accountApi.recordWeb3Call(
        'web3_function',
        this.wallet.walletType || 'unknown'
      ).catch(err => console.warn('Failed to record usage to API:', err))
    }
    return result
  }

  // Helper function to record usage and return result (async)
  private async recordUsageAndReturnAsync(resultPromise: Promise<FunctionResult>): Promise<FunctionResult> {
    const result = await resultPromise
    if (result.success && this.useTierLimits) {
      // Record in localStorage (instant feedback)
      UsageTracker.recordCall(this.userTier)
      
      // Also record to account API (async, don't wait)
      accountApi.recordWeb3Call(
        'web3_function',
        this.wallet.walletType || 'unknown'
      ).catch(err => console.warn('Failed to record usage to API:', err))
    }
    return result
  }
}
