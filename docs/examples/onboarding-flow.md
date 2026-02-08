# Onboarding Flow Example

This example shows two common onboarding paths:

1. User already has a license key → validate and store it
2. User needs to purchase → create order → collect payment → complete purchase → store license

## Core helpers

Use a stable device identifier per device.

```ts
import { DeviceFingerprint } from '@unilic/client';

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = localStorage.getItem('uls_device_id');
  if (existing) return existing;

  const deviceId = await DeviceFingerprint.generate();
  localStorage.setItem('uls_device_id', deviceId);
  return deviceId;
}

export function storeLicenseKey(licenseKey: string) {
  localStorage.setItem('uls_license_key', licenseKey);
}
```

## Setup client

```ts
import { LicenseClient } from '@unilic/client';

export const client = new LicenseClient({
  baseUrl: 'https://license-server.example.com/api',
  // Optional but recommended for public endpoints if your server requires it
  appKey: 'YOUR_APP_KEY',
});
```

## Scenario 1: Activate with an existing license key

```ts
import { client } from './client';
import { getOrCreateDeviceId, storeLicenseKey } from './storage';

export async function activateWithLicenseKey(licenseKey: string) {
  const deviceId = await getOrCreateDeviceId();

  const result = await client.validation.validate({
    licenseKey,
    deviceId,
  });

  if (result.valid) {
    storeLicenseKey(licenseKey);
    return { success: true, license: result.license };
  }

  return { success: false, reason: result.reason, error: result.error };
}
```

## Scenario 2: Purchase a new license

Typical flow:

1. Show plans (`client.products.getPlans(productCode)`)
2. User selects a plan
3. Create an order (`client.purchases.createOrder(...)`)
4. Collect payment (Stripe/Paystack/etc)
5. Complete purchase (`client.purchases.completePurchase(...)`)
6. Store the returned `licenseKey`

```ts
import { client } from './client';
import { storeLicenseKey } from './storage';

export async function listPlans(productCode: string) {
  return await client.products.getPlans(productCode);
}

export async function createOrder(options: {
  planCode: string;
  organizationData: {
    orgName: string;
    ownerName: string;
    ownerEmail: string;
  };
}) {
  return await client.purchases.createOrder(
    {
      planCode: options.planCode,
      organizationData: options.organizationData,
      paymentMethod: 'stripe',
    },
    // Optional: idempotency (recommended for retries)
    { idempotencyKey: crypto.randomUUID() }
  );
}

export async function completePurchase(options: { orderId: string; paymentReference: string }) {
  const result = await client.purchases.completePurchase(
    {
      orderId: options.orderId,
      paymentReference: options.paymentReference,
    },
    { idempotencyKey: crypto.randomUUID() }
  );

  storeLicenseKey(result.license.licenseKey);
  return result;
}
```

## Notes

- The SDK does not integrate directly with your payment UI; it expects you to provide a
  `paymentReference` after payment succeeds.
- For app gating, prefer `client.validation.validate(...)` and use the returned `license.tier` /
  `license.features`.
