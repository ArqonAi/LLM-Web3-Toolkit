# API Reference

## @arqon/web3-core

### WalletManager

Main class for managing wallet connections and blockchain interactions.

#### Constructor

```typescript
new WalletManager(options: WalletManagerOptions)
```

**Options:**
- `chains`: Array of Chain configurations
- `defaultChain`: Default blockchain to use
- `autoConnect`: Automatically connect on initialization (optional)
- `rpcTimeout`: RPC request timeout in milliseconds (default: 30000)
- `confirmations`: Number of confirmations to wait (default: 1)

#### Methods

##### connect(provider?: WalletProvider): Promise<WalletConnection>

Connect to wallet provider.

```typescript
const connection = await walletManager.connect('metamask');
```

##### disconnect(): Promise<void>

Disconnect wallet.

##### getBalance(address?: string): Promise<Balance>

Query native token balance.

```typescript
const balance = await walletManager.getBalance();
console.log(balance.formatted); // "1.5 ETH"
```

##### getTokenBalance(tokenAddress: string, ownerAddress?: string): Promise<TokenBalance>

Query ERC-20 token balance.

```typescript
const balance = await walletManager.getTokenBalance('0x...');
```

##### sendNative(to: string, amount: string): Promise<TransactionReceipt>

Send native tokens. Requires user approval.

```typescript
const receipt = await walletManager.sendNative(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '0.1'
);
```

##### estimateGas(tx: TransactionRequest): Promise<GasEstimate>

Estimate transaction gas cost.

```typescript
const estimate = await walletManager.estimateGas({
  to: '0x...',
  value: parseEther('0.1'),
});
```

##### switchChain(chainId: number): Promise<void>

Switch active blockchain network.

```typescript
await walletManager.switchChain(42161); // Arbitrum
```

##### executeFunction(functionName: string, params: any): Promise<FunctionCallResult>

Execute LLM function call.

```typescript
const result = await walletManager.executeFunction('get_balance', {
  address: '0x...'
});
```

**Supported Functions:**
- `get_wallet_address`
- `get_balance`
- `get_token_balance`
- `send_native`
- `send_token`
- `estimate_gas`
- `validate_address`
- `switch_chain`
- `get_gas_price`
- `resolve_ens`
- `lookup_ens`

---

## @arqon/web3-chains

Pre-configured blockchain network definitions.

### Available Chains

```typescript
import {
  ethereum,    // Ethereum Mainnet (1)
  sepolia,     // Sepolia Testnet (11155111)
  arbitrum,    // Arbitrum One (42161)
  optimism,    // Optimism (10)
  base,        // Base (8453)
  polygon,     // Polygon (137)
  avalanche,   // Avalanche C-Chain (43114)
  bsc,         // BNB Smart Chain (56)
} from '@arqon/web3-chains';
```

### Utilities

```typescript
import { getChainById, getChainByName, allChains, mainnetChains, testnetChains } from '@arqon/web3-chains';

const chain = getChainById(1); // Ethereum
const chain = getChainByName('arbitrum'); // Arbitrum One
```

---

## @arqon/web3-functions

LLM function calling schemas.

### OpenAI Functions

```typescript
import { openAIFunctions } from '@arqon/web3-functions/openai';

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'What is my balance?' }],
  functions: openAIFunctions,
  function_call: 'auto',
});
```

### Anthropic Tools

```typescript
import { anthropicTools } from '@arqon/web3-functions/anthropic';

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  tools: anthropicTools,
  messages: [{ role: 'user', content: 'Send 0.1 ETH to vitalik.eth' }],
});
```

### Function Categories

```typescript
import { readOnlyFunctions, writeFunctions } from '@arqon/web3-functions/openai';
import { readOnlyTools, writeTools } from '@arqon/web3-functions/anthropic';
```

---

## @arqon/web3-react

React hooks and components.

### Provider

```typescript
import { Web3Provider } from '@arqon/web3-react';
import { ethereum, arbitrum } from '@arqon/web3-chains';

function App() {
  return (
    <Web3Provider 
      chains={[ethereum, arbitrum]} 
      defaultChain={ethereum}
      autoConnect={false}
    >
      <YourApp />
    </Web3Provider>
  );
}
```

### Hooks

#### useWallet()

```typescript
import { useWallet } from '@arqon/web3-react';

function Component() {
  const { 
    address, 
    chainId, 
    isConnected, 
    isConnecting, 
    connect, 
    disconnect 
  } = useWallet();

  return (
    <button onClick={connect}>
      {isConnected ? `Connected: ${address}` : 'Connect Wallet'}
    </button>
  );
}
```

#### useBalance()

```typescript
import { useBalance } from '@arqon/web3-react';

function Component() {
  const { balance, loading, error, refetch } = useBalance();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>Balance: {balance?.formatted} {balance?.symbol}</div>;
}
```

#### useSendTransaction()

```typescript
import { useSendTransaction } from '@arqon/web3-react';

function Component() {
  const { sendNative, loading, error, receipt } = useSendTransaction();

  const handleSend = async () => {
    try {
      await sendNative('0x...', '0.1');
    } catch (err) {
      console.error(err);
    }
  };

  return <button onClick={handleSend}>Send ETH</button>;
}
```

### Components

#### ConnectWallet

```typescript
import { ConnectWallet } from '@arqon/web3-react';

<ConnectWallet 
  className="btn-primary"
  connectText="Connect Wallet"
  disconnectText="Disconnect"
  loadingText="Connecting..."
/>
```

#### WalletInfo

```typescript
import { WalletInfo } from '@arqon/web3-react';

<WalletInfo 
  className="wallet-info"
  showBalance={true}
/>
```

#### NetworkSwitcher

```typescript
import { NetworkSwitcher } from '@arqon/web3-react';
import { ethereum, arbitrum } from '@arqon/web3-chains';

<NetworkSwitcher 
  chains={[ethereum, arbitrum]}
  className="network-selector"
/>
```

#### TransactionConfirm

```typescript
import { TransactionConfirm } from '@arqon/web3-react';

<TransactionConfirm
  to="0x..."
  amount="0.1"
  onSuccess={(hash) => console.log('Success:', hash)}
  onCancel={() => console.log('Cancelled')}
/>
```

---

## Types

### Chain

```typescript
interface Chain {
  id: number;
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
  testnet?: boolean;
}
```

### Balance

```typescript
interface Balance {
  value: bigint;
  formatted: string;
  symbol: string;
  decimals: number;
}
```

### TransactionReceipt

```typescript
interface TransactionReceipt {
  transactionHash: string;
  blockNumber: bigint;
  blockHash: string;
  from: string;
  to: string | null;
  contractAddress: string | null;
  status: 'success' | 'reverted';
  gasUsed: bigint;
  effectiveGasPrice: bigint;
}
```

### FunctionCallResult

```typescript
interface FunctionCallResult {
  success: boolean;
  data?: any;
  error?: string;
  transactionHash?: string;
  receipt?: TransactionReceipt;
}
```
