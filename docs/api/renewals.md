# Renewals API

The Renewals API is exposed via `client.renewals`.

It supports two renewal styles:

1. **Admin/manual renewal** of a license key.
2. **End-user renewal** via a magic-link token flow.

## Methods

### `client.renewals.renew(request)` (Admin)

`POST /api/licenses/:licenseKey/renew`

```ts
client.setToken(token);
const res = await client.renewals.renew({
  licenseKey: 'MY-PRODUCT-ACM-2026-ABCD-EFGH-IJKL',
  durationDays: 365,
  paymentReference: 'pi_...',
});
```

### `client.renewals.requestMagicLink(request)`

`POST /api/renewal/request-magic-link`

Sends/requests a renewal link for a given license + email.

### `client.renewals.verifyToken(token)`

`GET /api/renewal/verify-token/:token`

Use this when a customer opens a renewal link.

### `client.renewals.processRenewalWithToken(data)`

`POST /api/renewal/process`

Completes a renewal using the token from the magic link.

## Related

- Renewal admin reporting: `/api/licenses` and `/guide/renewal-management`.
