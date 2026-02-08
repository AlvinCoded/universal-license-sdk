import type { StorageAdapter } from '../storage';
import type { License } from '@unilic/core';
import { CACHE_KEYS, DEFAULT_CONFIG } from '@unilic/core';

/**
 * License cache manager
 * Caches validated licenses to reduce API calls and improve performance
 *
 * Simple in-memory cache for license-centric calls.
 */
export class LicenseCache {
  constructor(
    public readonly storage: StorageAdapter,
    private ttl: number = DEFAULT_CONFIG.CACHE_TTL
  ) {}

  /**
   * Get cached license by key
   */
  async get(licenseKey: string): Promise<License | null> {
    try {
      const cacheKey = CACHE_KEYS.LICENSE(licenseKey);
      const cached = await this.storage.get<License>(cacheKey);

      if (!cached) return null;

      // Verify license hasn't expired
      if (this.isExpired(cached)) {
        await this.remove(licenseKey);
        return null;
      }

      return cached;
    } catch (error) {
      console.error('[LicenseCache] Get error:', error);
      return null;
    }
  }

  /**
   * Cache a license
   */
  async set(licenseKey: string, license: License): Promise<void> {
    try {
      const cacheKey = CACHE_KEYS.LICENSE(licenseKey);
      await this.storage.set(cacheKey, license, this.ttl);
    } catch (error) {
      console.error('[LicenseCache] Set error:', error);
    }
  }

  /**
   * Remove a license from cache
   */
  async remove(licenseKey: string): Promise<void> {
    try {
      const cacheKey = CACHE_KEYS.LICENSE(licenseKey);
      await this.storage.remove(cacheKey);
    } catch (error) {
      console.error('[LicenseCache] Remove error:', error);
    }
  }

  /**
   * Clear all cached licenses
   */
  async clear(): Promise<void> {
    try {
      await this.storage.clear();
    } catch (error) {
      console.error('[LicenseCache] Clear error:', error);
    }
  }

  /**
   * Check if license exists in cache
   */
  async has(licenseKey: string): Promise<boolean> {
    const cached = await this.get(licenseKey);
    return cached !== null;
  }

  /**
   * Cache validation result
   */
  async cacheValidation(licenseKey: string, deviceId: string, result: any): Promise<void> {
    try {
      const cacheKey = CACHE_KEYS.VALIDATION(licenseKey, deviceId);
      await this.storage.set(cacheKey, result, this.ttl);

      // Also cache the license if validation succeeded
      if (result.valid && result.license) {
        await this.set(licenseKey, result.license);
      }
    } catch (error) {
      console.error('[LicenseCache] Cache validation error:', error);
    }
  }

  /**
   * Get cached validation result
   */
  async getValidation(licenseKey: string, deviceId: string): Promise<any | null> {
    try {
      const cacheKey = CACHE_KEYS.VALIDATION(licenseKey, deviceId);
      return await this.storage.get(cacheKey);
    } catch (error) {
      console.error('[LicenseCache] Get validation error:', error);
      return null;
    }
  }

  /**
   * Check if license is expired based on cached data
   */
  private isExpired(license: License): boolean {
    if (!license.expires_at) return false;
    return new Date(license.expires_at) < new Date();
  }

  /**
   * Get days until expiry from cached license
   */
  async getDaysUntilExpiry(licenseKey: string): Promise<number | null> {
    // Read raw cached value so we can return 0 for expired licenses
    // (calling this.get() would remove expired entries and return null).
    const cacheKey = CACHE_KEYS.LICENSE(licenseKey);
    const license = await this.storage.get<License>(cacheKey);
    if (!license || !license.expires_at) return null;

    const expiryDate = new Date(license.expires_at);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime <= 0) {
      await this.remove(licenseKey);
      return 0;
    }

    return diffDays;
  }

  /**
   * Check if cached license is still valid (active and not expired)
   */
  async isValid(licenseKey: string): Promise<boolean> {
    const license = await this.get(licenseKey);
    if (!license) return false;

    return license.status === 'active' && !this.isExpired(license);
  }
}
