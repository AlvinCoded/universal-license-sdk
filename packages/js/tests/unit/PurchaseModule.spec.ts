import { describe, it, expect } from 'vitest';
import { PurchaseModule } from '../../src/modules/PurchaseModule';

describe('PurchaseModule', () => {
  it('completes purchase successfully', async () => {
    const fakeHttp: any = {
      post: async (url: string, _body: any) => {
        if (url === '/purchases/complete-purchase') {
          return { license: { licenseKey: 'NEW-KEY', expiresAt: '2026-01-01T00:00:00Z' } };
        }
        return {};
      },
    };

    const m = new PurchaseModule(fakeHttp);
    const res = await m.completePurchase({ orderId: 'ORD', paymentReference: 'pay_1' } as any);
    expect(res.license).toBeTruthy();
    expect(res.license.licenseKey).toBe('NEW-KEY');
  });

  it('handles failed purchase', async () => {
    const fakeHttp: any = {
      post: async () => {
        throw new Error('Payment failed');
      },
    };

    const m = new PurchaseModule(fakeHttp);
    await expect(
      m.completePurchase({ orderId: 'ORD', paymentReference: 'pay_1' } as any)
    ).rejects.toThrow('Payment failed');
  });
});
