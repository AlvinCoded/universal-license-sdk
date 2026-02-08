import { describe, it, expect, vi } from 'vitest';
import { RetryStrategy, exponentialBackoff, isRetryableError } from '../../../src/http/retry';

describe('Retry Logic', () => {
  describe('exponentialBackoff', () => {
    it('should calculate exponential backoff delay', () => {
      const config = {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        retryableStatusCodes: [500, 502, 503],
        retryableErrors: ['ECONNRESET'],
      };

      const delay1 = exponentialBackoff(0, config);
      const delay2 = exponentialBackoff(1, config);
      const delay3 = exponentialBackoff(2, config);

      // First retry should be close to initialDelay (with jitter)
      expect(delay1).toBeGreaterThanOrEqual(1000);
      expect(delay1).toBeLessThanOrEqual(1300); // 1000 + 30% jitter

      // Second retry should be close to 2x initialDelay
      expect(delay2).toBeGreaterThanOrEqual(2000);
      expect(delay2).toBeLessThanOrEqual(2600);

      // Third retry should be close to 4x initialDelay
      expect(delay3).toBeGreaterThanOrEqual(4000);
      expect(delay3).toBeLessThanOrEqual(5200);
    });

    it('should not exceed maxDelay', () => {
      const config = {
        maxRetries: 10,
        initialDelay: 1000,
        maxDelay: 5000,
        backoffMultiplier: 2,
        retryableStatusCodes: [],
        retryableErrors: [],
      };

      const delay = exponentialBackoff(10, config);
      expect(delay).toBeLessThanOrEqual(5000 * 1.3); // maxDelay + 30% jitter
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable HTTP status codes', () => {
      const config = {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        retryableErrors: [],
      };

      expect(isRetryableError({ response: { status: 500 } }, config)).toBe(true);
      expect(isRetryableError({ response: { status: 503 } }, config)).toBe(true);
      expect(isRetryableError({ response: { status: 400 } }, config)).toBe(false);
      expect(isRetryableError({ response: { status: 404 } }, config)).toBe(false);
    });

    it('should identify retryable network errors', () => {
      const config = {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        retryableStatusCodes: [],
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
      };

      expect(isRetryableError({ code: 'ECONNRESET' }, config)).toBe(true);
      expect(isRetryableError({ code: 'ETIMEDOUT' }, config)).toBe(true);
      expect(isRetryableError({ code: 'ENOTFOUND' }, config)).toBe(true);
      expect(isRetryableError({ code: 'EINVALID' }, config)).toBe(false);
    });

    it('should identify timeout errors', () => {
      expect(isRetryableError({ message: 'Request timeout' })).toBe(true);
      expect(isRetryableError({ message: 'Connection timed out' })).toBe(true);
      expect(isRetryableError({ message: 'Invalid request' })).toBe(false);
    });
  });

  describe('RetryStrategy', () => {
    it('should retry on retryable errors', async () => {
      const strategy = new RetryStrategy({ maxRetries: 3, initialDelay: 10 });
      let attempts = 0;

      const result = await strategy.execute(async () => {
        attempts++;
        if (attempts < 3) {
          throw { response: { status: 500 } };
        }
        return 'success';
      });

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const strategy = new RetryStrategy({ maxRetries: 3 });
      let attempts = 0;

      await expect(
        strategy.execute(async () => {
          attempts++;
          throw { response: { status: 400 } }; // Not retryable
        })
      ).rejects.toEqual({ response: { status: 400 } });

      expect(attempts).toBe(1);
    });

    it('should respect maxRetries', async () => {
      const strategy = new RetryStrategy({ maxRetries: 2, initialDelay: 10 });
      let attempts = 0;

      await expect(
        strategy.execute(async () => {
          attempts++;
          throw { response: { status: 500 } };
        })
      ).rejects.toEqual({ response: { status: 500 } });

      expect(attempts).toBe(3); // Initial + 2 retries
    });

    it('should call onRetry callback', async () => {
      const strategy = new RetryStrategy({ maxRetries: 2, initialDelay: 10 });
      const onRetry = vi.fn();
      let attempts = 0;

      await strategy.execute(async () => {
        attempts++;
        if (attempts < 2) {
          throw { response: { status: 503 } };
        }
        return 'success';
      }, onRetry);

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(
        expect.objectContaining({ response: { status: 503 } }),
        1
      );
    });
  });
});
