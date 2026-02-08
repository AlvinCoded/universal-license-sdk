import { describe, it, expect } from 'vitest';
import { LicenseClient } from '../../src/LicenseClient';
import { CACHE_KEYS } from '@universal-license/core';

describe('LicenseClient.getCachedLicense', () => {
  it('returns null when cache empty and returns cached object when present', async () => {
    const client = new LicenseClient({ baseUrl: 'http://localhost:1234', cache: true });

    const key = 'CACHED-KEY-1';
    const fakeLicense = {
      license_key: key,
      status: 'active',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };

    // Initially null
    const none = await client.getCachedLicense(key);
    expect(none).toBeNull();

    // Insert into underlying storage
    const cache = (client as any).cache;
    const storage = cache.storage;
    const cacheKey = CACHE_KEYS.LICENSE(key);
    await storage.set(cacheKey, fakeLicense);

    const got = await client.getCachedLicense(key);
    expect(got).toBeTruthy();
    expect(got?.license_key).toBe(key);
  });
});
