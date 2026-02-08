import { describe, it, expect, beforeEach } from 'vitest';
import { LicenseCache } from '../../../src/cache/LicenseCache';
import { MemoryStorage } from '../../../src/storage/MemoryStorage';
import type { License } from '@unilic/core';

describe('LicenseCache', () => {
  let cache: LicenseCache;
  let storage: MemoryStorage;

  const mockLicense: License = {
    id: 1,
    license_key: 'TEST-ORG-2025-A1B2-C3D4-E5F6',
    org_id: 1,
    org_name: 'Test Org',
    product_code: 'TEST-PROD',
    tier: 'pro',
    status: 'active',
    expires_at: new Date(Date.now() + 86400000).toISOString(), // +1 day
    max_users: 10,
    features: { feature1: true, feature2: false },
    issued_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    storage = new MemoryStorage('cache_');
    cache = new LicenseCache(storage, 60000); // 60 second TTL
  });

  describe('get and set', () => {
    it('should cache and retrieve a license', async () => {
      await cache.set(mockLicense.license_key, mockLicense);
      const cached = await cache.get(mockLicense.license_key);

      expect(cached).toEqual(mockLicense);
    });

    it('should return null for non-existent license', async () => {
      const cached = await cache.get('NONEXISTENT-KEY');
      expect(cached).toBeNull();
    });
  });

  describe('expiry handling', () => {
    it('should remove expired licenses from cache', async () => {
      const expiredLicense: License = {
        ...mockLicense,
        expires_at: new Date(Date.now() - 1000).toISOString(), // Expired
      };

      await cache.set(expiredLicense.license_key, expiredLicense);
      const cached = await cache.get(expiredLicense.license_key);

      // Should be removed from cache automatically
      expect(cached).toBeNull();
    });

    it('should keep valid licenses in cache', async () => {
      await cache.set(mockLicense.license_key, mockLicense);
      const cached = await cache.get(mockLicense.license_key);

      expect(cached).toEqual(mockLicense);
    });
  });

  describe('remove', () => {
    it('should remove a license from cache', async () => {
      await cache.set(mockLicense.license_key, mockLicense);
      expect(await cache.has(mockLicense.license_key)).toBe(true);

      await cache.remove(mockLicense.license_key);
      expect(await cache.has(mockLicense.license_key)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all cached licenses', async () => {
      await cache.set('LICENSE-1', mockLicense);
      await cache.set('LICENSE-2', { ...mockLicense, license_key: 'LICENSE-2' });

      await cache.clear();

      expect(await cache.has('LICENSE-1')).toBe(false);
      expect(await cache.has('LICENSE-2')).toBe(false);
    });
  });

  describe('validation caching', () => {
    it('should cache validation results', async () => {
      const validationResult = {
        valid: true,
        license: mockLicense,
      };

      await cache.cacheValidation(mockLicense.license_key, 'device-123', validationResult);

      const cached = await cache.getValidation(mockLicense.license_key, 'device-123');
      expect(cached).toEqual(validationResult);
    });

    it('should cache license when validation succeeds', async () => {
      const validationResult = {
        valid: true,
        license: mockLicense,
      };

      await cache.cacheValidation(mockLicense.license_key, 'device-123', validationResult);

      // License should be cached separately
      const cachedLicense = await cache.get(mockLicense.license_key);
      expect(cachedLicense).toEqual(mockLicense);
    });
  });

  describe('isValid', () => {
    it('should return true for active, non-expired licenses', async () => {
      await cache.set(mockLicense.license_key, mockLicense);
      const isValid = await cache.isValid(mockLicense.license_key);

      expect(isValid).toBe(true);
    });

    it('should return false for expired licenses', async () => {
      const expiredLicense: License = {
        ...mockLicense,
        expires_at: new Date(Date.now() - 1000).toISOString(),
      };

      await cache.set(expiredLicense.license_key, expiredLicense);
      const isValid = await cache.isValid(expiredLicense.license_key);

      expect(isValid).toBe(false);
    });

    it('should return false for revoked licenses', async () => {
      const revokedLicense: License = {
        ...mockLicense,
        status: 'revoked',
      };

      await cache.set(revokedLicense.license_key, revokedLicense);
      const isValid = await cache.isValid(revokedLicense.license_key);

      expect(isValid).toBe(false);
    });
  });

  describe('getDaysUntilExpiry', () => {
    it('should calculate days until expiry', async () => {
      const futureDate = new Date(Date.now() + 10 * 86400000); // +10 days
      const license: License = {
        ...mockLicense,
        expires_at: futureDate.toISOString(),
      };

      await cache.set(license.license_key, license);
      const days = await cache.getDaysUntilExpiry(license.license_key);

      expect(days).toBeGreaterThanOrEqual(9);
      expect(days).toBeLessThanOrEqual(10);
    });

    it('should return 0 for expired licenses', async () => {
      const expiredLicense: License = {
        ...mockLicense,
        expires_at: new Date(Date.now() - 1000).toISOString(),
      };

      await cache.set(expiredLicense.license_key, expiredLicense);
      const days = await cache.getDaysUntilExpiry(expiredLicense.license_key);

      expect(days).toBe(0);
    });

    it('should return null for non-existent licenses', async () => {
      const days = await cache.getDaysUntilExpiry('NONEXISTENT');
      expect(days).toBeNull();
    });
  });
});
