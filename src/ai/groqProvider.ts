import type { AIProvider, AICompletionOptions } from './provider';

export interface GroqProviderConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  fallbackModels?: string[];
}

/**
 * Resilient multi-model cascade for Groq AI:
 * 1. Primary: Llama 3.3 70B (Deep reasoning, syllabus breakdown)
 * 2. Secondary: Llama 3.1 8B Instant (Ultra-fast, massive rate limit headroom, immune to spikes)
 * 3. Tertiary: Mixtral 8x7B (High context capacity fallback)
 * 4. Quaternary: Gemma 2 9B (Google Gemma lightweight fallback)
 */
const DEFAULT_FALLBACK_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
];

export class GroqProvider implements AIProvider {
  name = 'Groq';
  private apiKey: string;
  private primaryModel: string;
  private fallbackModels: string[];
  private baseUrl: string;

  constructor(config: GroqProviderConfig) {
    this.apiKey = config.apiKey;
    this.primaryModel = config.model || 'llama-3.3-70b-versatile';
    this.baseUrl = config.baseUrl || 'https://api.groq.com/openai/v1';
    
    // Ensure primary model is first, followed by remaining fallbacks without duplicates
    const fallbacks = config.fallbackModels || DEFAULT_FALLBACK_MODELS;
    this.fallbackModels = [
      this.primaryModel,
      ...fallbacks.filter(m => m !== this.primaryModel),
    ];
  }

  async complete(opts: AICompletionOptions): Promise<string> {
    if (!this.apiKey || !this.apiKey.trim()) {
      throw new Error('Groq API Key is missing. Please add your free key in Settings.');
    }

    const endpoint = `${this.baseUrl.replace(/\/$/, '')}/chat/completions`;
    let lastError: any = null;

    // Cascade through available models if spikes, 429 rate limits, or 503 capacity issues occur
    for (let i = 0; i < this.fallbackModels.length; i++) {
      const activeModel = this.fallbackModels[i];

      try {
        const body: Record<string, unknown> = {
          model: activeModel,
          messages: [
            { role: 'system', content: opts.system },
            { role: 'user', content: opts.user },
          ],
          temperature: opts.temperature ?? 0.2,
          max_tokens: opts.maxTokens ?? 3500,
        };

        if (opts.json) {
          body.response_format = { type: 'json_object' };
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey.trim()}`,
          },
          body: JSON.stringify(body),
          signal: opts.signal,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          let retryAfterHeader = response.headers.get('Retry-After');
          let retryAfterSec = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;

          const errorData = {
            status: response.status,
            statusText: response.statusText,
            model: activeModel,
            retryAfter: isNaN(Number(retryAfterSec)) ? undefined : retryAfterSec,
            message: `Groq API Error (${response.status}) on ${activeModel}: ${errorText.slice(0, 300)}`,
          };

          // If rate limit (429) or server spike (500, 502, 503) or token overflow, cascade to next model
          if (response.status === 429 || response.status >= 500 || response.status === 400) {
            console.warn(`[Groq Auto-Failover] ${activeModel} reported status ${response.status}. Cascading to next model...`);
            lastError = errorData;
            // Short backoff before next model attempt
            await new Promise(r => setTimeout(r, 600));
            continue;
          }

          throw errorData;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (typeof content !== 'string') {
          throw new Error(`Groq model ${activeModel} returned empty or invalid response format`);
        }

        return content;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          throw err;
        }

        lastError = err;
        console.warn(`[Groq Failover] Exception on model ${activeModel}:`, err?.message || err);
        
        // Try next model if we have more in cascade
        if (i < this.fallbackModels.length - 1) {
          await new Promise(r => setTimeout(r, 500));
          continue;
        }
      }
    }

    throw lastError || new Error('All Groq AI models in cascade exhausted. Please verify your API key or network connection.');
  }
}
