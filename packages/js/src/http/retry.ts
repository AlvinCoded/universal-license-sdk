/**
 * Retry logic for failed HTTP requests
 * Implements exponential backoff strategy matching your backend rate limits
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
  retryableErrors: string[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH'],
};

/**
 * Calculate exponential backoff delay
 */
export function exponentialBackoff(
  retryCount: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay = Math.min(
    config.initialDelay * Math.pow(config.backoffMultiplier, retryCount),
    config.maxDelay
  );

  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * delay;
  return delay + jitter;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any, config: RetryConfig = DEFAULT_RETRY_CONFIG): boolean {
  // Network errors
  if (error.code && config.retryableErrors.includes(error.code)) {
    return true;
  }

  // HTTP status codes
  if (error.response?.status && config.retryableStatusCodes.includes(error.response.status)) {
    return true;
  }

  // Timeout errors
  if (typeof error.message === 'string') {
    const message = error.message.toLowerCase();
    if (message.includes('timeout') || message.includes('timed out')) {
      return true;
    }
  }

  return false;
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry strategy implementation
 */
export class RetryStrategy {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Execute a function with retry logic
   *
   * @example
   * ```typescript
   * const retry = new RetryStrategy({ maxRetries: 3 });
   * const result = await retry.execute(async () => {
   *   return await fetch('/api/licenses/validate', { method: 'POST' });
   * });
   * ```
   */
  async execute<T>(
    fn: () => Promise<T>,
    onRetry?: (error: any, attempt: number) => void
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry if max attempts reached
        if (attempt === this.config.maxRetries) {
          break;
        }

        // Don't retry if error is not retryable
        if (!isRetryableError(error, this.config)) {
          throw error;
        }

        // Calculate delay and wait
        const delay = exponentialBackoff(attempt, this.config);

        if (onRetry) {
          onRetry(error, attempt + 1);
        }

        await sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Check if should retry based on error
   */
  shouldRetry(error: any): boolean {
    return isRetryableError(error, this.config);
  }

  /**
   * Get delay for next retry attempt
   */
  getDelay(attempt: number): number {
    return exponentialBackoff(attempt, this.config);
  }
}
