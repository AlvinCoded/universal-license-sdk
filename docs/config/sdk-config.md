# SDK Configuration

This page documents the configuration options that are actually supported by the SDK packages in
this repository.

## JavaScript/TypeScript (`@unilic/client`)

```ts
import { LicenseClient } from '@unilic/client';

const client = new LicenseClient({
  baseUrl: 'https://license.yourcompany.com/api',

  // Admin endpoints (optional)
  apiKey: 'JWT_TOKEN',

  // Public / app-scoped endpoints (optional)
  appKey: 'YOUR_APP_KEY',
  appCode: 'YOUR_APP_CODE',

  // Networking
  timeout: 30_000, // ms
  retries: 3,

  // Caching
  cache: true,
  cacheTTL: 60 * 60 * 1000, // ms

  debug: false,
  headers: {
    // Any additional headers
  },
});
```

### Supported fields

These fields come from `SDKConfig` in `@unilic/core`:

- `baseUrl` (required)
- `apiKey` (optional) → adds `Authorization: Bearer <token>`
- `appKey` (optional) → adds `X-ULS-App-Key: <value>`
- `appCode` (optional) → adds `X-ULS-App-Code: <value>`
- `timeout` (ms), `retries`
- `cache` (boolean), `cacheTTL` (ms)
- `debug` (boolean)
- `headers` (object)

## React (`@unilic/react`)

`@unilic/react` accepts the same `SDKConfig` and passes it to `LicenseClient`.

```tsx
import { LicenseProvider } from '@unilic/react';

export function App() {
  return (
    <LicenseProvider
      config={{
        baseUrl: 'https://license.yourcompany.com/api',
        appKey: 'YOUR_APP_KEY',
        cache: true,
      }}
    >
      {/* ... */}
    </LicenseProvider>
  );
}
```

## PHP (`universal-license/php-client`)

PHP uses an array-based config (`UniversalLicense\LicenseClient`).

```php
use UniversalLicense\LicenseClient;

$client = new LicenseClient([
  'baseUrl' => 'https://license.yourcompany.com/api',

  // Optional: admin/auth token (Bearer)
  'token' => null,

  // Optional: application headers for public/app-scoped endpoints
  'appKey' => 'YOUR_APP_KEY',
  'appCode' => 'YOUR_APP_CODE',

  // Networking
  'timeout' => 30, // seconds
  'retries' => 3,

  // Caching
  'cache' => true,

  'debug' => false,
  'headers' => [
    // additional headers
  ],
]);
```

### Notes (PHP)

- `timeout` is in **seconds** (Guzzle).
- There is no `cacheTTL` config key for the base PHP client.
  - GET caching uses a default file cache with a 1-hour TTL.
  - Validation can be cached explicitly via
    `validation->validateWithCache($licenseKey, $deviceId, $ttlSeconds)`.
- To customize caching (directory/TTL/backend), provide a cache implementation:

```php
use UniversalLicense\Cache\FileCache;

$client->setCache(new FileCache(__DIR__ . '/cache', 7200));
```

## Laravel (PHP)

The Laravel integration publishes a `license.php` config file (see
`packages/php/src/Laravel/config/license.php`).

Laravel-specific settings (like cache `driver` and cache `ttl`) are configured there and wired up by
the service provider.

See the Laravel installation page for the supported env vars and setup details.
