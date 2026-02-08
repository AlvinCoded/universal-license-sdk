# Caching Strategies

## What the SDK actually caches

### JavaScript/TypeScript (`@universal-license/client`)

With caching enabled (default), the JS SDK caches:

- Successful validation results (`client.validation.validate(...)`)
- License lookups (`client.licenses.get(licenseKey)`)
- Public plan lists (`client.products.getPlans(productCode)`)

The cache uses:

- `localStorage` in browsers
- in-memory storage in Node.js

### PHP (`universal-license/php-client`)

With caching enabled, the PHP SDK caches successful **GET** responses via a file cache by default.

The PHP SDK also provides explicit validation caching via `validateWithCache(...)`.

## Recommended patterns

### 1) App startup: cache-first validation

```ts
const result = await client.validation.validate({
  licenseKey,
  deviceId,
});

if (!result.valid) {
  // show activation / upgrade / renewal UI
}
```

When caching is enabled, the SDK will reuse a recent successful validation for the same
`(licenseKey, deviceId)`.

### 2) Offline-friendly check

If you only need a quick offline-friendly boolean:

```ts
const ok = await client.validation.isValidCached(licenseKey);
```

This does not call the network.

### 3) Forcing a fresh validation

If you need to bypass cached results (for example right after an admin action), you can temporarily
disable caching:

```ts
client.setConfig({ cache: false });
const fresh = await client.validation.validate({ licenseKey, deviceId });
client.setConfig({ cache: true });
```

### 4) Clear cache after renewals/admin edits

```ts
client.clearCache();
```

## Tuning

### JavaScript TTL

```ts
const client = new LicenseClient({
  baseUrl: 'https://license.example.com/api',
  cache: true,
  cacheTTL: 15 * 60 * 1000, // 15 minutes
});
```

### PHP validation TTL

```php
$result = $client->validation->validateWithCache($licenseKey, $deviceId, 900); // 15 minutes
```
