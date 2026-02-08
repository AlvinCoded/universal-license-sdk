# API Reference

This section documents the public API surface of the JavaScript/TypeScript SDK (`@unilic/client`).

The SDK is a typed wrapper around an HTTP API. As long as your server implements the same routes and
JSON shapes, you can use the SDK unchanged.

## Base URL

`baseUrl` should point at the API root, including the `/api` prefix.

Examples:

- `https://license.example.com/api`
- `http://localhost:3001/api`

Why: module paths in the SDK are expressed as `/licenses/validate`, `/products`, etc, and the HTTP
client joins them onto `baseUrl`.

## Public vs Admin endpoints

The SDK exposes both “public app” flows (no auth) and “admin/dashboard” flows (JWT required).

- Public (no token): validation, pricing/plans listing, purchase order creation/lookup, renewal
  magic-link flows, health checks.
- Admin (token required): managing licenses/products/plans/organizations, viewing activity logs,
  imports/exports, payment management.

To authenticate admin calls, pass `apiKey` in the constructor or set it later via
`client.setToken(token)`.

## Top-level client

The central class is `LicenseClient`.

```ts
import { LicenseClient } from '@unilic/client';

const client = new LicenseClient({
  baseUrl: 'https://license.example.com/api',
});
```

See:

- `LicenseClient` overview: `/api/client`
- Common types: `/api/types`

## Modules

Each module groups a related set of endpoints.

### Public-facing modules

- Validation: `client.validation` (`POST /licenses/validate`, `GET /licenses/keys/public`)
- Products: `client.products` (`GET /products`, `GET /purchases/plans/:productCode`,
  `GET /plans/:planCode`)
- Purchases: `client.purchases` (`POST /purchases/create-order`,
  `POST /purchases/complete-purchase`, `GET /purchases/order/:orderId`)
- Renewals: `client.renewals` (magic-link + renewal processing)
- Health: `client.health` (health checks)

### Admin modules (require JWT)

- Auth: `client.auth` (login/verify/profile)
- Licenses: `client.licenses` (license list/details/stats/revoke/renewal settings)
- Plans: `client.plans` (plan management)
- Organizations: `client.organizations`
- Activity: `client.activity`
- Payments: `client.payments`
- Import/Export: `client.imports`, `client.exports`

Each module has its own page under `/api/*`.

## Error model (high-level)

Most module methods throw on network failures and return parsed JSON on success.

Validation is a bit special:

- A validation failure is returned as `{ valid: false, error, reason, ... }`.
- The server commonly uses these `reason` values:
  - `INVALID_KEY`
  - `REVOKED`
  - `SUSPENDED`
  - `EXPIRED`
  - `DEVICE_MISMATCH`
  - `INSUFFICIENT_TIER`
  - `MISSING_FEATURES`

See `/api/validation` and `/guide/error-handling`.
