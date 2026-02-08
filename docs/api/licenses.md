# Licenses API (Admin)

The Licenses API is exposed via `client.licenses`.

These methods are intended for admin dashboards and back-office tools.

## Common operations

### `client.licenses.get(licenseKey)`

Fetch a license by key.

```ts
client.setToken(token);
const license = await client.licenses.get('MY-PRODUCT-ACM-2026-ABCD-EFGH-IJKL');
console.log(license.status, license.expires_at);
```

### `client.licenses.getAll(filters?)`

List licenses with optional filters.

```ts
const licenses = await client.licenses.getAll({
  status: 'active',
  tier: 'pro',
  productCode: 'MY-PRODUCT',
  search: 'Acme',
});
```

### `client.licenses.generate(data)`

Generate a new license (manual creation).

```ts
const result = await client.licenses.generate({
  planCode: 'MY-PRODUCT-PRO-ANNUAL',
  organizationData: {
    orgName: 'Acme Corp',
    ownerName: 'Jane Doe',
    ownerEmail: 'jane@acme.com',
  },
  durationDays: 365,
});

console.log(result.license.license_key);
```

### `client.licenses.revoke(licenseKey, reason)`

Revoke an existing license.

### `client.licenses.delete(licenseKey)`

Permanently delete a license.

### `client.licenses.getStats()`

Get dashboard statistics.

### Renewals (admin)

- `client.licenses.getUpcomingRenewals(daysAhead?)`
- `client.licenses.getUpcomingRenewalsSummary(daysAhead?)`
- `client.licenses.getRenewalsHistory(licenseKey)`
- `client.licenses.updateRenewalSettings(licenseKey, request)`
- `client.licenses.getRenewalNotifications(licenseKey)`
- `client.licenses.testEmail(request)`

## Notes

- License entities returned by admin endpoints use snake_case fields (e.g., `expires_at`).
- For end-user apps, prefer `/api/validation` + guides under `/guide/*`.
