# Cache

Caching improves performance by reducing repeated network calls.

This page documents how caching behaves in the SDK packages in this repository.

## JavaScript/TypeScript (`@unilic/client`)

### What is cached

- License lookups via `client.licenses.get(licenseKey)` (cache-first)
- Validation results via `client.validation.validate(...)` (cache-first for successful validations)
- Product plan lists via `client.products.getPlans(productCode)`

### Configuration

```ts
import { LicenseClient } from '@unilic/client';

const client = new LicenseClient({
  baseUrl: 'https://license.example.com/api',
  cache: true, // default: true
  cacheTTL: 60 * 60 * 1000, // default: 1 hour (ms)
});
```

### Storage backend

- In browsers, the SDK uses `localStorage` (with a prefix).
- In Node.js, the SDK falls back to an in-memory storage adapter.

### Clearing cache

```ts
client.clearCache();
```

## PHP (`universal-license/php-client`)

### GET response caching

When `'cache' => true`, the PHP client enables a file-based cache by default.

- Default cache directory: `sys_get_temp_dir() . '/universal-license-cache'`
- Default TTL: 3600 seconds

Clear all cached entries:

```php
$client->clearCache();
```

### Validation caching (explicit)

For app flows that validate frequently, use `validateWithCache(...)`:

```php
$result = $client->validation->validateWithCache(
  $licenseKey,
  $deviceId,
  3600 // ttl seconds
);
```

### Custom cache

To customize cache directory or default TTL, inject your own cache implementation:

```php
use UniversalLicense\Cache\FileCache;

$client->setCache(new FileCache(__DIR__ . '/cache', 7200));
```

## Laravel (PHP)

Laravel integration uses Laravel’s cache stores when enabled in `config/license.php`.

- Configure cache `driver`, `ttl`, and `prefix` in the published config file.
- The service provider wires the Laravel cache store into the SDK via `$client->setCache(...)`.
