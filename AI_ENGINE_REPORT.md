# Add-On Enterprise AI Engine Architecture & Health Report – PLACE@ASET

**Module:** Enterprise AI Engine  
**Version:** 1.0 Enterprise  
**Status:** FULLY IMPLEMENTED & OPERATIONAL  

---

## 1. Multi-Provider Architecture

The Enterprise AI Engine uses an extensible `IAIProvider` interface pattern allowing administrators to dynamically configure and swap providers without application code changes.

```
                  ┌───────────────────────────────┐
                  │    AI Router Service & Cache  │
                  └──────────────┬────────────────┘
                                 │
         ┌───────────────┬───────┴───────┬───────────────┬───────────────┐
         ▼               ▼               ▼               ▼               ▼
  Google Gemini     OpenAI GPT     Local Ollama     Azure OpenAI    Anthropic Claude
  (Primary OCR)    (Explanations)   (Fallback)       (Enterprise)      (Reasoning)
```

## 2. Dynamic Task Routing Matrix

| Task Type | Primary Provider | Fallback Provider | Max Latency Target | Caching |
| :--- | :--- | :--- | :--- | :--- |
| **OCR Cleanup** | Google Gemini (`gemini-1.5-flash`) | OpenAI GPT (`gpt-4o`) | < 500 ms | SHA-256 Enabled |
| **Question Categorization** | Google Gemini | OpenAI GPT | < 300 ms | SHA-256 Enabled |
| **Step Solution Generation** | OpenAI GPT | Google Gemini | < 800 ms | SHA-256 Enabled |
| **Question Generator** | OpenAI GPT | Google Gemini | < 1000 ms | SHA-256 Enabled |
| **Duplicate Detection** | Google Gemini | OpenAI GPT | < 200 ms | SHA-256 Enabled |

## 3. Fallback Sequence & Resilience

1. Attempt Primary Provider Execution.
2. If Primary fails (network, API rate limit, invalid key), automatically log warning and invoke Fallback Provider.
3. If Fallback fails, route task to Local Ollama instance (`http://localhost:11434`) or place into `ai_jobs` retry queue.
4. Response caching utilizes SHA-256 hash lookup in `ai_cache` to serve redundant requests instantly (< 5ms).
