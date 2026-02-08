# Offline Validation

Offline validation in this SDK is primarily **cache-first validation**:

- When you successfully validate online, the SDK caches the result.
- Later, calling `client.validation.validate(...)` will return the cached success result (as long as
  it has not expired), even if the network is down.

Optionally, you can add **signature verification** on top of cached validation so that an attacker
cannot tamper with the cached payload.

## What “offline validation” means here

Offline validation is not a separate endpoint and there is no separate `validateOffline()` API.
Instead:

1. You do an online validation at least once.
2. You persist a stable `deviceId`.
3. You re-run validation periodically; if the cache is fresh, the SDK returns the cached success
   response without needing the network.

If there is no cached result (or it is expired) and the app is offline, the request will fail with a
network error.

## Prerequisites

### Use a stable device identifier

The validation cache is keyed by `(licenseKey, deviceId)`. If your device ID changes, you will miss
the cache.

See [/guide/device-fingerprinting](/guide/device-fingerprinting) for recommended approaches.

## Cache-first validation (JavaScript/TypeScript)

```ts
import { LicenseClient } from '@unilic/client';
import { DeviceFingerprint } from '@unilic/core';

const client = new LicenseClient({
  baseUrl: 'https://your-license-api.example.com/api',
  cache: true,
});

// Persist this once per device install.
const deviceId = await DeviceFingerprint.generate();

// Online (first run): populates the cache on success.
const result1 = await client.validation.validate({
  licenseKey: 'PROD-ORG-2026-AAAA-BBBB-CCCC',
  deviceId,
  requiredTier: 'pro',
  requiredFeatures: ['advancedReporting'],
});

// Later (offline-friendly): returns cached success result if present and not expired.
const result2 = await client.validation.validate({
  licenseKey: 'PROD-ORG-2026-AAAA-BBBB-CCCC',
  deviceId,
  requiredTier: 'pro',
  requiredFeatures: ['advancedReporting'],
});
```

### Handling offline vs. “invalid license”

Validation failures come in two flavors:

- A successful HTTP response with `valid: false` (license is invalid, expired, revoked, device
  mismatch, etc.)
- A thrown error (network failure, timeout, server unreachable)

Recommended pattern:

```ts
async function validateWithOfflineFallback(params: {
  licenseKey: string;
  deviceId: string;
  requiredTier?: 'standard' | 'pro' | 'enterprise';
  requiredFeatures?: string[];
}) {
  try {
    return await client.validation.validate(params);
  } catch (err) {
    // If you are offline and the cache is missing/expired, you will land here.
    // Decide whether to:
    // - restrict features,
    // - allow a grace period,
    // - or block until online.
    throw err;
  }
}
```

## Optional: verify cached validation signatures

The public validation response can include a `signature` that lets you verify the response payload
locally.

### What is signed

The typical signing payload is the JSON string:

```ts
JSON.stringify({ licenseKey, tier, deviceId, expiresAt });
```

If you need additional fields to be tamper-evident offline (e.g. `features`, `maxUsers`), your
server must include them in the signed payload.

### Recommended flow

1. When online, fetch the public key once and persist it.
2. When you receive a successful validation response (online or cached), verify the signature before
   trusting it.

```ts
import { verifySignature } from '@unilic/core';

// 1) Prefetch public key (online) and persist it in your own storage.
const publicKey = await client.validation.getPublicKey();

// 2) Validate (may return cached success response).
const res = await client.validation.validate({ licenseKey, deviceId });
if (!res.valid || !res.license || !res.signature) {
  // Either invalid license, or your server does not include signatures.
  return res;
}

// 3) Verify signature before trusting cached data.
const payload = JSON.stringify({
  licenseKey: res.license.licenseKey,
  tier: res.license.tier,
  deviceId,
  expiresAt: res.license.expiresAt,
});

const ok = await verifySignature(payload, res.signature, publicKey);
if (!ok) {
  // Treat as untrusted: clear cache, force online re-check, or block.
  client.clearCache();
  throw new Error('Cached license signature verification failed');
}

return res;
```

## Choosing an offline policy

Cache-first validation is best paired with an explicit policy:

- **Max offline window**: require an online validation at least every N hours/days.
- **Grace behavior**: decide what happens when offline and cache is expired (limited features vs.
  block).
- **UI cues**: show when the app is running in a cached/offline state.

## Next steps

- [/guide/caching-strategies](/guide/caching-strategies)
- [/guide/error-handling](/guide/error-handling)
- [/guide/feature-gating](/guide/feature-gating)
- [/guide/license-validation](/guide/license-validation)
