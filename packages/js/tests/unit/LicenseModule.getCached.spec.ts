import { describe, it, expect } from 'vitest';
import { LicenseModule } from '../../src/modules/LicenseModule';

describe('LicenseModule.getCached', () => {
  it('returns null when no cache configured', async () => {
    const module = new LicenseModule({} as any, undefined);
    const result = await module.getCached('NOPE');
    expect(result).toBeNull();
  });

  it('returns cached license when available', async () => {
    const fakeCache = {
      get: async (key: string) => ({
        license_key: key,
        status: 'active',
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      }),
    } as any;

    const module = new LicenseModule({} as any, fakeCache);
    const res = await module.getCached('TEST-KEY');
    expect(res).toBeTruthy();
    expect(res?.license_key).toBe('TEST-KEY');
  });
});
