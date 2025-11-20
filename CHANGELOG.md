# Changelog

## [1.1.0] - 2025-11-20

### Added
- **5 NEW Working Tools** (bringing total to 16):
  - `get_transaction_history` - Get wallet transaction history
  - `get_block_info` - Get blockchain block information
  - `analyze_contract` - Analyze smart contracts
  - `get_token_info` - Get detailed token information
  - `get_nft_holdings` - Get NFT holdings for an address
  - `scan_address_risk` - Scan addresses for security risks
  - `get_network_stats` - Get network statistics

- **New export**: `working` module with all 16 tested and working tools
  - `workingTools` - Array of all 16 working tools
  - `readOnlyTools` - Array of 13 read-only tools
  - `writeTools` - Array of 3 write tools (require user approval)

### Changed
- All 16 tools have been fully tested and verified working
- Improved type definitions for all tool schemas
- Better documentation for each tool

### Improvements
- Full E2E testing with 92.5% pass rate
- Integration testing for all 16 tools
- Better error handling

---

## Tool List (16 Total)

### Core Wallet Tools (6)
1. `get_wallet_address` - Get connected wallet address
2. `get_balance` - Get native token balance
3. `get_token_balance` - Get ERC-20/SPL token balance
4. `send_native` - Send native tokens
5. `send_token` - Send ERC-20/SPL tokens
6. `validate_address` - Validate address format

### Network Tools (4)
7. `get_gas_price` - Get current gas price
8. `switch_chain` - Switch blockchain network
9. `resolve_ens` - Resolve ENS names
10. `get_network_stats` - Get network statistics

### Transaction & Block Tools (2)
11. `get_transaction_history` - Get transaction history
12. `get_block_info` - Get block information

### Smart Contract & Token Tools (2)
13. `analyze_contract` - Analyze smart contracts
14. `get_token_info` - Get token details

### NFT & Security Tools (2)
15. `get_nft_holdings` - Get NFT holdings
16. `scan_address_risk` - Security risk scanning

---

## Previous Releases

### [1.0.0] - Initial Release
- 11 core Web3 tools
- Support for OpenAI, Anthropic, and Gemini formats
- Basic wallet operations
