import { describe, it, expect } from 'vitest';
import { RenewalModule } from '../../src/modules/RenewalModule';

describe('RenewalModule', () => {
  it('requests magic link successfully', async () => {
    const fakeHttp: any = {
      post: async (url: string, _body: any) => {
        if (url === '/renewal/request-magic-link') return { success: true, message: 'Email sent' };
        if (url === '/renewal/process') return { success: true, newExpiry: '2026-01-01T00:00:00Z' };
        return {};
      },
      get: async (_url: string) => ({ license: { licenseKey: 'ABC' } }),
    };

    const m = new RenewalModule(fakeHttp);
    const req = { licenseKey: 'ABC', email: 'a@b.com' } as any;
    const res = await m.requestMagicLink(req);
    expect(res.success).toBe(true);

    const verify = await m.verifyToken('token123');
    expect(verify).toBeTruthy();

    const proc = await m.processRenewalWithToken({
      token: 'token123',
      paymentReference: 'pay_1',
    } as any);
    expect(proc).toBeTruthy();
  });
});
