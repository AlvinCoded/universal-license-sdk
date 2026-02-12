import { describe, it, expect } from 'vitest';
import { PaymentModule } from '../../src/modules/PaymentModule';
import { LicenseError } from '../../src/errors';

describe('PaymentModule', () => {
  it('fetches subscription license via correct endpoint', async () => {
    const fakeHttp: any = {
      get: async (url: string) => {
        expect(url).toBe('/payment/subscription-license/sub_123');
        return {
          license: {
            licenseKey: 'LIC-KEY',
            tier: 'pro',
            expiresAt: '2026-01-01T00:00:00Z',
            status: 'active',
          },
        };
      },
    };

    const m = new PaymentModule(fakeHttp);
    const res = await m.getSubscriptionLicense('sub_123');
    expect(res.license.licenseKey).toBe('LIC-KEY');
  });

  it('waitForSubscriptionLicense polls until available', async () => {
    let calls = 0;
    const fakeHttp: any = {
      get: async () => {
        calls++;
        if (calls < 3) {
          throw new LicenseError('License not found');
        }
        return {
          license: {
            licenseKey: 'READY-KEY',
            tier: 'standard',
            expiresAt: '2026-01-01T00:00:00Z',
            status: 'active',
          },
        };
      },
    };

    const m = new PaymentModule(fakeHttp);
    const res = await m.waitForSubscriptionLicense('sub_456', { timeoutMs: 5_000, intervalMs: 1 });
    expect(res.license.licenseKey).toBe('READY-KEY');
    expect(calls).toBeGreaterThanOrEqual(3);
  });
});
