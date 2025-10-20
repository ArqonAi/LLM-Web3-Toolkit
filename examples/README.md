# Examples

Production-ready examples demonstrating LLM-Web3-Toolkit integration.

## Available Examples

### 1. Next.js Application
Location: `./nextjs`

Full-featured Next.js app with:
- Wallet connection UI
- Balance display
- Network switching
- LLM chat integration with OpenRouter
- Server-side API routes

**Run:**
```bash
cd nextjs
cp .env.example .env
# Add your OPENROUTER_API_KEY
npm install
npm run dev
```

Open http://localhost:3000

### 2. Node.js Backend
Location: `./nodejs`

Express server demonstrating:
- REST API endpoints
- LLM function calling backend
- OpenAI and Anthropic support
- Function execution handling

**Run:**
```bash
cd nodejs
cp .env.example .env
# Add your OPENROUTER_API_KEY
npm install
npm start
```

Server runs on http://localhost:3001

**Endpoints:**
- `GET /health` - Health check
- `GET /api/functions` - List available functions
- `POST /api/chat` - Chat with LLM
- `POST /api/execute-function` - Execute Web3 function

### 3. Autonomous Agent
Location: `./agent`

Autonomous agent that:
- Executes multi-step Web3 tasks
- Uses LLM reasoning
- Handles function calling loops
- Demonstrates agent patterns

**Run:**
```bash
cd agent
cp .env.example .env
# Add your OPENROUTER_API_KEY
npm install
npm start
```

## Requirements

- Node.js 18+
- MetaMask or compatible wallet (for frontend examples)
- OpenRouter API key (get from https://openrouter.ai)
- Testnet ETH (for transaction testing)

## Configuration

All examples use OpenRouter for LLM inference. Configure with:

```env
OPENROUTER_API_KEY=your_key_here
```

Supported models:
- `openai/gpt-4o-mini` (default, cost-effective)
- `openai/gpt-4o`
- `anthropic/claude-3.5-sonnet`
- `anthropic/claude-3-opus`

## Testing

Examples can be tested on:
- **Sepolia Testnet** (recommended for development)
- **Ethereum Mainnet** (production only)

Get Sepolia ETH from faucets:
- https://sepoliafaucet.com
- https://www.alchemy.com/faucets/ethereum-sepolia

## Architecture

```
examples/
├── nextjs/          # Full-stack Next.js application
│   ├── app/         # Next.js App Router
│   │   ├── page.tsx           # Main UI with Web3Provider
│   │   └── api/               # API routes
│   │       └── llm-web3/      # LLM integration endpoint
│   └── next.config.js
│
├── nodejs/          # Backend Express server
│   └── src/
│       └── server.ts          # REST API with LLM
│
└── agent/           # Autonomous agent
    └── src/
        └── agent.ts           # Multi-turn LLM agent

```

## Integration Patterns

### Pattern 1: Frontend + API Route (Next.js)
User → React UI → Next.js API Route → LLM → Web3 Functions

### Pattern 2: Backend Service (Node.js)
Client → REST API → LLM → Web3 Functions → Response

### Pattern 3: Autonomous Agent
Task → Agent Loop → LLM → Function Calls → Complete

## Production Considerations

1. **API Key Security**: Use environment variables, never commit keys
2. **Rate Limiting**: Implement rate limits on LLM calls
3. **Transaction Confirmation**: Always require user approval for writes
4. **Error Handling**: Comprehensive error handling for network issues
5. **Gas Estimation**: Estimate gas before transactions
6. **Address Validation**: Validate all addresses before use

## Support

Issues: https://github.com/ArqonAi/LLM-Web3-Toolkit/issues
Documentation: https://github.com/ArqonAi/LLM-Web3-Toolkit/tree/main/docs
