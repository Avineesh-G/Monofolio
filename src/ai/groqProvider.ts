import type { AIProvider, AICompletionOptions } from './provider';

export interface GroqProviderConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export class GroqProvider implements AIProvider {
  name = 'Groq';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: GroqProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'llama-3.3-70b-versatile';
    this.baseUrl = config.baseUrl || 'https://api.groq.com/openai/v1';
  }

  async complete(opts: AICompletionOptions): Promise<string> {
    if (!this.apiKey || !this.apiKey.trim()) {
      throw new Error('Groq API Key is missing. Please add your key in Settings.');
    }

    const endpoint = `${this.baseUrl.replace(/\/$/, '')}/chat/completions`;

    const body: Record<string, unknown> = {
      model: this.model,
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
        retryAfter: isNaN(Number(retryAfterSec)) ? undefined : retryAfterSec,
        message: `Groq API Error (${response.status}): ${errorText.slice(0, 300)}`,
      };

      throw errorData;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
      throw new Error('Groq returned empty or invalid response format');
    }

    return content;
  }
}
