# Multi-Chain Support Architecture

## Overview

LLM-Web3-Toolkit is designed to support multiple blockchains through a unified interface. Currently supports EVM chains, with Solana and Tron coming soon.

---

## Supported Chains

### ✅ EVM Chains (Fully Supported)
- Ethereum (Mainnet, Sepolia, Holesky)
- Polygon (Mainnet, Amoy)
- Binance Smart Chain
- Arbitrum (One, Nova, Sepolia)
- Optimism (Mainnet, Sepolia)
- Base (Mainnet, Sepolia)
- Avalanche C-Chain
- Fantom Opera
- Gnosis Chain
- Celo
- Moonbeam/Moonriver
- Cronos
- Aurora

### 🔄 Coming Soon
- **Solana** - Via WalletConnect + Solana Web3.js
- **Tron** - Via WalletConnect + TronWeb
- **Cosmos** - Via WalletConnect
- **Near** - Via WalletConnect
- **Aptos** - Via Petra wallet

---

## Architecture

### 1. Chain Abstraction Layer

```typescript
interface Chain {
  id: number | string;  // EVM: number, Solana: string
  name: string;
  network: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: { http: string[] };
    public: { http: string[] };
  };
  blockExplorers?: {
    default: { name: string; url: string };
  };
  contracts?: Record<string, string>;
  testnet?: boolean;
}
```

### 2. Provider Abstraction

```typescript
interface ChainProvider {
  connect(): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  sendTransaction(params: any): Promise<string>;
  signMessage(message: string): Promise<string>;
  getBalance(address: string): Promise<bigint>;
}
```

### 3. Multi-Chain Wallet Manager

```typescript
class MultiChainWalletManager {
  private providers: Map<string, ChainProvider>;
  
  // Connect to specific chain
  async connectChain(chainType: 'evm' | 'solana' | 'tron'): Promise<void>;
  
  // Switch between chains
  async switchChain(chainId: string): Promise<void>;
  
  // Execute on specific chain
  async executeOnChain(chainId: string, action: () => Promise<any>): Promise<any>;
}
```

---

## Implementation Plan

### Phase 1: EVM Chains ✅ COMPLETE
- [x] Ethereum and testnets
- [x] Layer 2s (Arbitrum, Optimism, Base)
- [x] Sidechains (Polygon, BSC, Avalanche)
- [x] MetaMask integration
- [x] WalletConnect v2 foundation

### Phase 2: Solana Integration 🔄 IN PROGRESS
- [ ] Solana Web3.js integration
- [ ] Phantom wallet support
- [ ] Solflare wallet support
- [ ] WalletConnect for Solana
- [ ] SPL token support
- [ ] Solana program interactions

### Phase 3: Tron Integration ⏳ PLANNED
- [ ] TronWeb integration
- [ ] TronLink wallet support
- [ ] WalletConnect for Tron
- [ ] TRC-20 token support
- [ ] Smart contract interactions

### Phase 4: Additional Chains ⏳ PLANNED
- [ ] Cosmos ecosystem
- [ ] Near Protocol
- [ ] Aptos
- [ ] Sui

---

## WalletConnect Multi-Chain

### Namespaces

WalletConnect v2 uses namespaces to support multiple chains:

```typescript
const namespaces = {
  // EVM chains
  eip155: {
    methods: ['eth_sendTransaction', 'personal_sign'],
    chains: ['eip155:1', 'eip155:137', 'eip155:56'],
    events: ['chainChanged', 'accountsChanged'],
  },
  
  // Solana
  solana: {
    methods: ['solana_signTransaction', 'solana_signMessage'],
    chains: ['solana:mainnet', 'solana:devnet'],
    events: [],
  },
  
  // Tron
  tron: {
    methods: ['tron_signTransaction'],
    chains: ['tron:mainnet'],
    events: [],
  },
};
```

### Supported Wallets

| Wallet | EVM | Solana | Tron | WalletConnect |
|--------|-----|--------|------|---------------|
| MetaMask | ✅ | ❌ | ❌ | ✅ |
| Trust Wallet | ✅ | ✅ | ✅ | ✅ |
| Rainbow | ✅ | ❌ | ❌ | ✅ |
| Coinbase Wallet | ✅ | ✅ | ❌ | ✅ |
| Phantom | ❌ | ✅ | ❌ | ✅ |
| Solflare | ❌ | ✅ | ❌ | ✅ |
| TronLink | ❌ | ❌ | ✅ | ✅ |

---

## Usage Examples

### Connect to Multiple Chains

```typescript
import { MultiChainWalletManager } from '@arqon/web3-core';
import { ethereum, polygon, solana, tron } from '@arqon/web3-chains';

const wallet = new MultiChainWalletManager({
  chains: [ethereum, polygon, solana, tron],
  walletConnect: {
    projectId: 'YOUR_PROJECT_ID',
  },
});

// Connect via WalletConnect (supports all chains)
await wallet.connect('walletconnect');

// Or connect chain-specific wallet
await wallet.connectChain('evm', 'metamask');
await wallet.connectChain('solana', 'phantom');
await wallet.connectChain('tron', 'tronlink');
```

### Execute Cross-Chain Operations

```typescript
// Send on Ethereum
const ethTx = await wallet.executeOnChain('ethereum', async () => {
  return wallet.sendNative({
    to: '0x...',
    amount: '0.1',
  });
});

// Send on Solana
const solTx = await wallet.executeOnChain('solana', async () => {
  return wallet.sendNative({
    to: 'DYw8j...',
    amount: '0.5',
  });
});

// Send on Tron
const tronTx = await wallet.executeOnChain('tron', async () => {
  return wallet.sendNative({
    to: 'TRX...',
    amount: '100',
  });
});
```

### LLM Function Calling (Chain-Agnostic)

```typescript
// LLM can call same function on any chain
const tools = [
  {
    name: 'send_native',
    description: 'Send native tokens (ETH, SOL, TRX, etc.)',
    parameters: {
      chain: { type: 'string', enum: ['ethereum', 'solana', 'tron'] },
      to: { type: 'string' },
      amount: { type: 'string' },
    },
  },
];

// LLM decides which chain based on context
const result = await wallet.executeFunction('send_native', {
  chain: 'solana',
  to: 'DYw8j...',
  amount: '0.5',
});
```

---

## Chain-Specific Features

### Ethereum/EVM
- Smart contracts (read/write)
- ERC-20/721/1155 tokens
- ENS domains
- Gas optimization (EIP-1559)
- Batch transactions

### Solana
- Programs (Solana's smart contracts)
- SPL tokens
- Solana Name Service (SNS)
- Priority fees
- Transaction versioning

### Tron
- Smart contracts
- TRC-20 tokens
- Energy/Bandwidth management
- Resource delegation
- Freeze/Unfreeze TRX

---

## Migration Guide

### From EVM-Only to Multi-Chain

**Before:**
```typescript
import { WalletManager } from '@arqon/web3-core';
import { ethereum } from '@arqon/web3-chains';

const wallet = new WalletManager({
  chains: [ethereum],
  defaultChain: ethereum,
});
```

**After:**
```typescript
import { MultiChainWalletManager } from '@arqon/web3-core';
import { ethereum, solana, tron } from '@arqon/web3-chains';

const wallet = new MultiChainWalletManager({
  chains: [ethereum, solana, tron],
  defaultChain: ethereum,
});
```

---

## Testing

### Multi-Chain Test Suite

```bash
# Test EVM chains
pnpm test tests/e2e/evm-chains.test.ts

# Test Solana
pnpm test tests/e2e/solana.test.ts

# Test Tron
pnpm test tests/e2e/tron.test.ts

# Test cross-chain operations
pnpm test tests/e2e/cross-chain.test.ts
```

---

## Roadmap

**Q1 2025:**
- ✅ EVM chains (complete)
- 🔄 WalletConnect v2 (in progress)
- ⏳ Solana integration

**Q2 2025:**
- Tron integration
- Cosmos ecosystem
- Enhanced cross-chain features

**Q3 2025:**
- Near Protocol
- Aptos/Sui
- Cross-chain bridges

---

## Resources

- [WalletConnect Docs](https://docs.walletconnect.com/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [TronWeb](https://developers.tron.network/docs/tronweb)
- [Chain List](https://chainlist.org/)

---

## Contributing

To add support for a new chain:

1. Create chain definition in `packages/chains/src/`
2. Implement provider in `packages/core/src/providers/`
3. Add LLM function schemas
4. Write E2E tests
5. Update documentation

See `CONTRIBUTING.md` for details.
