# LicenseClient API

The `LicenseClient` class is the main entry point for the JavaScript/TypeScript SDK
(`@universal-license/client`).

It composes feature modules (validation, products, purchases, admin tools) and provides a few
convenience helpers.

## Constructor

### `new LicenseClient(config)`

```ts
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: 'https://license.example.com/api',
  cache: true,
  cacheTTL: 60 * 60 * 1000,
  timeout: 30_000,
  retries: 3,
  debug: false,

  // Optional headers used by public / app-scoped endpoints
  appKey: 'YOUR_APP_KEY',
  appCode: 'YOUR_APP_CODE',

  // Optional JWT for admin endpoints
  apiKey: 'YOUR_ADMIN_JWT',
});
```

## `SDKConfig` (what is actually supported)

`SDKConfig` is exported from `@universal-license/core` (and re-exported by
`@universal-license/client`).

Supported fields:

- `baseUrl` (required)
- `apiKey` (optional) → sent as `Authorization: Bearer <token>`
- `appKey` / `appCode` (optional) → sent as `X-ULS-App-Key` / `X-ULS-App-Code`
- `timeout` (ms), `retries`
- `cache` (boolean), `cacheTTL` (ms)
- `debug` (boolean)
- `headers` (extra headers for every request)

## Modules

### Public app modules

- `client.validation`
- `client.products`
- `client.purchases`
- `client.renewals`
- `client.ownership` (ownership + invite flows)
- `client.health`

### Admin modules (JWT required)

- `client.auth`
- `client.licenses`
- `client.plans`
- `client.organizations`
- `client.activity`
- `client.payments`
- `client.imports` / `client.exports`

To set/replace the JWT at runtime:

```ts
client.setToken(token);
// or
client.setApiKey(token);
```

## Convenience helpers

- `client.validate(...)` → forwards to `client.validation.validate(...)`
- `client.isLicenseValid(licenseKey)` → cache-first boolean check, falls back to online validation
- `client.hasFeature(licenseKey, feature)` / `client.hasTier(licenseKey, requiredTier)`
- `client.getDaysUntilExpiry(licenseKey)`
- `client.clearCache()`
- `client.testConnection()` → calls `GET /health` via the internal HTTP client

## Exports

`@universal-license/client` also exports:

- Error classes: `LicenseError`, `ValidationError`, `NetworkError`, `PurchaseError`
- HTTP utilities: `HttpClient`, retry helpers
- Storage helpers: `LocalStorage`, `SessionStorage`, `MemoryStorage`
- Cache: `LicenseCache`
- Convenience: `createClient(config)` and `VERSION`

## Data shapes (important)

- **Admin endpoints** generally return database-shaped objects (often `snake_case`).
- **Validation** responses return a simplified `license` payload (`camelCase`) designed for apps.

For exact request/response fields, prefer the TypeScript types exported by the SDK and the
per-module pages under `/api/*`.
