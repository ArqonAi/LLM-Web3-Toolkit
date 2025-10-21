# LLM Provider Integration Guide

## Supported Providers

| Provider | Status | Format | API Key |
|----------|--------|--------|---------|
| OpenAI | ✅ | Tools | OPENAI_API_KEY |
| OpenRouter | ✅ | Tools | OPENROUTER_API_KEY |
| Anthropic | ✅ | Tools | ANTHROPIC_API_KEY |
| **Grok (xAI)** | ✅ NEW | Tools | XAI_API_KEY |
| **Google Gemini** | ✅ NEW | Custom | GEMINI_API_KEY |

---

## Quick Start Examples

### OpenAI / Grok (Same Format)
```typescript
import { openaiTools } from '@arqon/web3-functions';

// Works with both OpenAI and Grok
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${API_KEY}` },
  body: JSON.stringify({
    model: 'gpt-4o-mini', // or 'grok-beta' for xAI
    messages: [{ role: 'user', content: 'Check ETH balance' }],
    tools: openaiTools.openAITools,
  }),
});
```

### Google Gemini
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { gemini } from '@arqon/web3-functions';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  tools: [{ functionDeclarations: gemini.geminiFunctions }],
});
```

### OpenRouter (100+ Models)
```typescript
import { openaiTools } from '@arqon/web3-functions';

const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}` },
  body: JSON.stringify({
    model: 'anthropic/claude-3.5-sonnet',
    tools: openaiTools.openAITools,
  }),
});
```

---

## Model Recommendations

- **Best Overall:** OpenAI GPT-4o
- **Best Value:** OpenRouter gpt-4o-mini
- **Best Reasoning:** Claude 3.5 Sonnet
- **Free Tier:** Gemini 1.5 Flash
- **Privacy:** Grok or Local Models
