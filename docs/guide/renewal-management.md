# Renewal Management

This guide covers renewal flows supported by the SDK.

There are two common approaches:

1. **Admin / back-office renewal** (you already know the license key)
2. **Self-service renewal via magic link** (customer renews from an email link)

## 1) Admin / back-office renewal

### Renew a license by key

Use `client.renewals.renew(...)`:

```ts
const result = await client.renewals.renew({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  durationDays: 365,
  paymentReference: 'pi_...',
});

console.log(result.license.expiresAt);
```

### Track upcoming renewals

```ts
const upcoming = await client.licenses.getUpcomingRenewalsSummary(30);
console.log(upcoming.count);

for (const lic of upcoming.renewals) {
  // Admin License objects are typically snake_case
  console.log(lic.license_key, lic.expires_at);
}
```

### Configure renewal settings

Enable/disable renewal and auto-renew flags:

```ts
await client.licenses.updateRenewalSettings('PROD-ORG-2025-XXXX-XXXX-XXXX', {
  renewalEnabled: true,
  autoRenew: true,
});
```

### Notifications and email tests

```ts
const notifications = await client.licenses.getRenewalNotifications('PROD-ORG-2025-XXXX-XXXX-XXXX');

await client.licenses.testEmail({
  to: 'ops@example.com',
  subject: 'Test renewal email',
});
```

## 2) Self-service renewal (magic link)

### Request a renewal link

```ts
await client.renewals.requestMagicLink({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  email: 'customer@example.com',
});
```

Your server sends an email containing a token link.

### Verify a token (optional)

```ts
const verify = await client.renewals.verifyToken(token);
if (!verify.valid) throw new Error('Invalid or expired token');

console.log(verify.license.orgName, verify.license.expiresAt);
```

### Process the renewal using the token

```ts
const renewed = await client.renewals.processRenewalWithToken({
  token,
  durationDays: 365,
  paymentReference: 'pi_...',
});

console.log('Renewed until:', renewed.license.expiresAt);
```

## Notes

- Payment collection is app-specific. Typically you:
  1. collect payment (Stripe/Paystack/etc)
  2. then call the renewal API with a `paymentReference`
- Admin license objects are generally `snake_case`; renewal responses are simplified (`camelCase`).
