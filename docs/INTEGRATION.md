# Integration Guide

## OpenAI Integration

### Setup

```bash
npm install openai @arqon/web3-core @arqon/web3-chains @arqon/web3-functions
```

### Basic Implementation

```typescript
import OpenAI from 'openai';
import { WalletManager } from '@arqon/web3-core';
import { ethereum } from '@arqon/web3-chains';
import { openAIFunctions } from '@arqon/web3-functions/openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const walletManager = new WalletManager({
  chains: [ethereum],
  defaultChain: ethereum,
});

async function chat(userMessage: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a Web3 assistant with blockchain function access.',
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
    functions: openAIFunctions,
    function_call: 'auto',
  });

  const message = completion.choices[0].message;

  if (message.function_call) {
    const result = await walletManager.executeFunction(
      message.function_call.name,
      JSON.parse(message.function_call.arguments)
    );

    return result;
  }

  return { message: message.content };
}

// Usage
const result = await chat('What is my wallet address?');
console.log(result);
```

---

## Anthropic Claude Integration

### Setup

```bash
npm install @anthropic-ai/sdk @arqon/web3-core @arqon/web3-chains @arqon/web3-functions
```

### Basic Implementation

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { WalletManager } from '@arqon/web3-core';
import { ethereum } from '@arqon/web3-chains';
import { anthropicTools } from '@arqon/web3-functions/anthropic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const walletManager = new WalletManager({
  chains: [ethereum],
  defaultChain: ethereum,
});

async function chat(userMessage: string) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    tools: anthropicTools,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  for (const block of message.content) {
    if (block.type === 'tool_use') {
      const result = await walletManager.executeFunction(
        block.name,
        block.input
      );

      return result;
    }
  }

  return { message: message.content };
}

// Usage
const result = await chat('Validate address 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
console.log(result);
```

---

## OpenRouter Integration

### Setup

```bash
npm install @arqon/web3-core @arqon/web3-chains @arqon/web3-functions
```

### Basic Implementation

```typescript
import { WalletManager } from '@arqon/web3-core';
import { ethereum } from '@arqon/web3-chains';
import { openAIFunctions } from '@arqon/web3-functions/openai';

const walletManager = new WalletManager({
  chains: [ethereum],
  defaultChain: ethereum,
});

async function chat(userMessage: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://your-site.com',
      'X-Title': 'Your App Name',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Web3 assistant.',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      functions: openAIFunctions,
      function_call: 'auto',
    }),
  });

  const data = await response.json();
  const message = data.choices[0].message;

  if (message.function_call) {
    const result = await walletManager.executeFunction(
      message.function_call.name,
      JSON.parse(message.function_call.arguments)
    );

    return result;
  }

  return { message: message.content };
}
```

---

## Next.js Integration

### App Router (app directory)

```typescript
// app/providers.tsx
'use client';

import { Web3Provider } from '@arqon/web3-react';
import { ethereum, arbitrum } from '@arqon/web3-chains';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider chains={[ethereum, arbitrum]} defaultChain={ethereum}>
      {children}
    </Web3Provider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// app/page.tsx
'use client';

import { ConnectWallet, useWallet, useBalance } from '@arqon/web3-react';

export default function Home() {
  const { address } = useWallet();
  const { balance } = useBalance();

  return (
    <div>
      <ConnectWallet />
      {address && <p>Address: {address}</p>}
      {balance && <p>Balance: {balance.formatted} {balance.symbol}</p>}
    </div>
  );
}
```

### API Route with LLM

```typescript
// app/api/web3-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openAIFunctions } from '@arqon/web3-functions/openai';

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
      functions: openAIFunctions,
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

---

## Node.js Backend Integration

### Express Server

```typescript
import express from 'express';
import { WalletManager } from '@arqon/web3-core';
import { ethereum } from '@arqon/web3-chains';
import { openAIFunctions } from '@arqon/web3-functions/openai';

const app = express();
app.use(express.json());

const walletManager = new WalletManager({
  chains: [ethereum],
  defaultChain: ethereum,
});

app.post('/api/execute-function', async (req, res) => {
  try {
    const { functionName, params } = req.body;
    
    const result = await walletManager.executeFunction(functionName, params);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

## Autonomous Agent Pattern

```typescript
import { WalletManager } from '@arqon/web3-core';
import { ethereum } from '@arqon/web3-chains';
import { openAIFunctions } from '@arqon/web3-functions/openai';

class Web3Agent {
  private walletManager: WalletManager;
  private conversationHistory: any[] = [];

  constructor() {
    this.walletManager = new WalletManager({
      chains: [ethereum],
      defaultChain: ethereum,
    });

    this.conversationHistory.push({
      role: 'system',
      content: 'You are an autonomous Web3 agent with blockchain function access.',
    });
  }

  async run(task: string) {
    this.conversationHistory.push({
      role: 'user',
      content: task,
    });

    let completed = false;
    let iterations = 0;

    while (!completed && iterations < 5) {
      iterations++;

      const response = await this.callLLM();
      const message = response.choices[0].message;

      if (message.function_call) {
        const result = await this.walletManager.executeFunction(
          message.function_call.name,
          JSON.parse(message.function_call.arguments)
        );

        this.conversationHistory.push({
          role: 'function',
          name: message.function_call.name,
          content: JSON.stringify(result),
        });
      } else {
        console.log('Agent:', message.content);
        completed = true;
      }
    }
  }

  private async callLLM() {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: this.conversationHistory,
        functions: openAIFunctions,
      }),
    });

    return response.json();
  }
}

// Usage
const agent = new Web3Agent();
await agent.run('Validate address 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb and check its balance');
```

---

## Security Best Practices

### Transaction Confirmation

Always require explicit user confirmation for write operations:

```typescript
const { sendNative } = useSendTransaction();

const handleSend = async () => {
  const confirmed = window.confirm(
    `Send 0.1 ETH to ${recipientAddress}?`
  );

  if (confirmed) {
    await sendNative(recipientAddress, '0.1');
  }
};
```

### Address Validation

Always validate addresses before transactions:

```typescript
const result = await walletManager.executeFunction('validate_address', {
  address: userInputAddress,
});

if (!result.data.valid) {
  throw new Error('Invalid address');
}
```

### Gas Estimation

Estimate gas before executing transactions:

```typescript
const estimate = await walletManager.estimateGas({
  to: recipientAddress,
  value: parseEther(amount),
});

console.log(`Estimated cost: ${estimate.estimatedCostFormatted} ETH`);
```

### Rate Limiting

Implement rate limiting for LLM function calls:

```typescript
const rateLimiter = new Map();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);

  if (userLimit && now - userLimit < 1000) {
    return false; // Too many requests
  }

  rateLimiter.set(userId, now);
  return true;
}
```
