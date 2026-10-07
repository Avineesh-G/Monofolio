export interface RateLimiterConfig {
  maxConcurrent?: number;
  minSpacingMs?: number;
  maxRetries?: number;
}

export class RateLimiter {
  private maxConcurrent: number;
  private minSpacingMs: number;
  private maxRetries: number;
  private runningCount = 0;
  private lastRequestTime = 0;
  private queue: (() => Promise<void>)[] = [];

  constructor(config: RateLimiterConfig = {}) {
    this.maxConcurrent = config.maxConcurrent ?? 2;
    this.minSpacingMs = config.minSpacingMs ?? 250;
    this.maxRetries = config.maxRetries ?? 3;
  }

  async execute<T>(
    fn: () => Promise<T>,
    onRetry?: (attempt: number, delayMs: number, reason: string) => void,
    signal?: AbortSignal
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task = async () => {
        if (signal?.aborted) {
          reject(new DOMException('Aborted by user', 'AbortError'));
          return;
        }

        this.runningCount++;
        let attempt = 0;

        while (true) {
          if (signal?.aborted) {
            this.runningCount--;
            this.next();
            reject(new DOMException('Aborted by user', 'AbortError'));
            return;
          }

          // Enforce minimum spacing
          const elapsed = Date.now() - this.lastRequestTime;
          if (elapsed < this.minSpacingMs) {
            await new Promise(r => setTimeout(r, this.minSpacingMs - elapsed));
          }
          this.lastRequestTime = Date.now();

          try {
            const result = await fn();
            this.runningCount--;
            this.next();
            resolve(result);
            return;
          } catch (error: unknown) {
            attempt++;
            const isAbort = error instanceof Error && error.name === 'AbortError';
            if (isAbort || attempt > this.maxRetries) {
              this.runningCount--;
              this.next();
              reject(error);
              return;
            }

            // Check if error is 429 or 5xx
            const errObj = error as { status?: number; retryAfter?: number; message?: string };
            const isRateLimit = errObj?.status === 429 || errObj?.message?.includes('429');
            const isServerError = errObj?.status && errObj.status >= 500;

            if (isRateLimit || isServerError) {
              // Calculate exponential backoff with jitter
              let delayMs = errObj.retryAfter
                ? errObj.retryAfter * 1000
                : Math.min(16000, Math.pow(2, attempt) * 1500 + Math.random() * 1000);

              const reason = isRateLimit
                ? `Groq free tier rate limit hit. Pausing for ${(delayMs / 1000).toFixed(1)}s (Attempt ${attempt}/${this.maxRetries})`
                : `AI server busy. Retrying in ${(delayMs / 1000).toFixed(1)}s...`;

              onRetry?.(attempt, delayMs, reason);

              await new Promise(r => setTimeout(r, delayMs));
            } else {
              // Non-retryable error
              this.runningCount--;
              this.next();
              reject(error);
              return;
            }
          }
        }
      };

      if (this.runningCount < this.maxConcurrent) {
        task();
      } else {
        this.queue.push(task);
      }
    });
  }

  private next() {
    if (this.queue.length > 0 && this.runningCount < this.maxConcurrent) {
      const nextTask = this.queue.shift();
      nextTask?.();
    }
  }
}

export const globalRateLimiter = new RateLimiter({
  maxConcurrent: 2,
  minSpacingMs: 300,
  maxRetries: 3,
});
