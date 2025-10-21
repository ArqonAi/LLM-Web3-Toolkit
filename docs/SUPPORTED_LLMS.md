# Supported LLM Providers

Complete list of AI models that work with LLM-Web3-Toolkit.

---

## ✅ Fully Supported (100%)

### 1. OpenAI
- **Models:** GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-3.5-turbo
- **Format:** Tools (OpenAI v1.1+)
- **Function Calling:** ✅ Excellent
- **Package:** `@arqon/web3-functions/openai-tools`
- **API:** https://api.openai.com/v1/chat/completions
- **Cost:** $$$

### 2. OpenRouter (100+ Models)
- **Models:** Access to GPT-4, Claude, Gemini, Llama, Mistral, and more
- **Format:** Tools (OpenAI-compatible)
- **Function Calling:** ✅ Excellent
- **Package:** `@arqon/web3-functions/openai-tools`
- **API:** https://openrouter.ai/api/v1/chat/completions
- **Cost:** $ (varies by model)
- **Best for:** Cost optimization, model flexibility

**Popular Models:**
- `openai/gpt-4o-mini` - Fast & cheap
- `anthropic/claude-3.5-sonnet` - Best reasoning
- `google/gemini-pro-1.5` - Free tier
- `meta-llama/llama-3.2-90b` - Open source

### 3. Anthropic Claude
- **Models:** Claude 3.5 Sonnet, Claude 3 Opus, Haiku
- **Format:** Tools (Anthropic format)
- **Function Calling:** ✅ Excellent
- **Package:** `@arqon/web3-functions/anthropic`
- **API:** https://api.anthropic.com/v1/messages
- **Cost:** $$

### 4. Grok (xAI) ⭐ NEW
- **Models:** Grok-beta
- **Format:** Tools (OpenAI-compatible)
- **Function Calling:** ✅ Excellent
- **Package:** `@arqon/web3-functions/openai-tools`
- **API:** https://api.x.ai/v1/chat/completions
- **Cost:** $$
- **Best for:** Privacy, xAI ecosystem

### 5. Google Gemini ⭐ NEW
- **Models:** Gemini 1.5 Pro, Gemini 1.5 Flash
- **Format:** Custom (Gemini format)
- **Function Calling:** ✅ Excellent
- **Package:** `@arqon/web3-functions/gemini`
- **API:** Google Generative AI SDK
- **Cost:** $ (Free tier available!)
- **Best for:** Budget, long context (2M tokens)

---

## 🔄 Via OpenRouter

### 6. Meta Llama
- **Models:** Llama 3.2 90B, Llama 3.1 405B
- **Via:** OpenRouter
- **Function Calling:** ✅ Good
- **Cost:** $

### 7. Mistral AI
- **Models:** Mistral Large, Mistral Medium
- **Via:** OpenRouter
- **Function Calling:** ✅ Good
- **Cost:** $$

### 8. Cohere
- **Models:** Command R+, Command R
- **Via:** OpenRouter
- **Function Calling:** ✅ Good
- **Cost:** $

### 9. Perplexity
- **Models:** Perplexity Llama 70B Online
- **Via:** OpenRouter
- **Function Calling:** ✅ Good
- **Cost:** $
- **Special:** Real-time web search

---

## 🏠 Local Models

### 10. Ollama
- **Models:** Llama, Mistral, CodeLlama, etc.
- **Format:** OpenAI-compatible
- **Function Calling:** ✅ Good (model dependent)
- **Package:** `@arqon/web3-functions/openai-tools`
- **API:** http://localhost:11434/v1/chat/completions
- **Cost:** Free (local)
- **Best for:** Privacy, no API costs

### 11. LM Studio
- **Models:** Any GGUF model
- **Format:** OpenAI-compatible
- **Function Calling:** ✅ Good (model dependent)
- **Package:** `@arqon/web3-functions/openai-tools`
- **API:** http://localhost:1234/v1/chat/completions
- **Cost:** Free (local)

---

## 📊 Feature Matrix

| Provider | Tools | Streaming | Vision | Context | Cost/1M | Speed |
|----------|-------|-----------|--------|---------|---------|-------|
| **OpenAI GPT-4o** | ✅ | ✅ | ✅ | 128K | $5 | Fast |
| **OpenRouter** | ✅ | ✅ | ✅ | Varies | $0.10+ | Fast |
| **Claude 3.5** | ✅ | ✅ | ✅ | 200K | $3 | Fast |
| **Grok** | ✅ | ✅ | ⏳ | ? | $2 | Fast |
| **Gemini 1.5** | ✅ | ✅ | ✅ | 2M | $0.075 | Very Fast |
| **Llama 3.2** | ✅ | ✅ | ❌ | 128K | $0.20 | Medium |
| **Mistral** | ✅ | ✅ | ❌ | 128K | $2 | Fast |
| **Local** | ✅ | ✅ | ❌ | Varies | Free | Slow |

---

## 🎯 Recommendations

### By Use Case

**Production Apps:**
- Primary: OpenAI GPT-4o (reliability)
- Fallback: OpenRouter gpt-4o-mini (cost)

**Development:**
- OpenRouter gpt-4o-mini (fast, cheap)
- Gemini Flash (free tier)

**Privacy/On-Premise:**
- Grok (xAI ecosystem)
- Ollama/LM Studio (fully local)

**Budget-Conscious:**
1. Gemini 1.5 Flash (free tier)
2. OpenRouter gpt-4o-mini ($0.10/1M)
3. Local models (free)

**Best Quality:**
1. Claude 3.5 Sonnet (reasoning)
2. OpenAI GPT-4o (general)
3. Gemini 1.5 Pro (long context)

**Fastest:**
1. Gemini 1.5 Flash
2. OpenAI GPT-4o-mini
3. Claude 3 Haiku

---

## 🔧 Implementation Status

| Provider | Schema | Tested | Example | Docs |
|----------|--------|--------|---------|------|
| OpenAI | ✅ | ✅ | ✅ | ✅ |
| OpenRouter | ✅ | ✅ | ✅ | ✅ |
| Anthropic | ✅ | ✅ | ✅ | ✅ |
| Grok | ✅ | ⏳ | ✅ | ✅ |
| Gemini | ✅ | ⏳ | ✅ | ✅ |
| Local | ✅ | ⏳ | ⏳ | ⏳ |

---

## 📦 Package Reference

```typescript
// OpenAI, Grok, OpenRouter, Local models
import { openaiTools } from '@arqon/web3-functions/openai-tools';

// Anthropic Claude
import { anthropic } from '@arqon/web3-functions/anthropic';

// Google Gemini
import { gemini } from '@arqon/web3-functions/gemini';

// Smart Contracts (all providers)
import { contractTools } from '@arqon/web3-functions/contracts-tools';
```

---

## 🚀 Getting Started

See `docs/LLM_PROVIDERS.md` for detailed integration guides.

Examples:
- `examples/node/index.ts` - OpenRouter
- `examples/grok-gemini-example.ts` - Grok & Gemini
- `tests/e2e/live-api.test.ts` - OpenRouter tests
