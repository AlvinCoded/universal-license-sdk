# Validation API

Complete guide to license validation with the Universal License SDK.

## Overview

The Validation API provides methods to validate license keys against your server. It supports:

- ✅ Online validation with server verification
- ✅ Cache-first / offline-friendly behavior (when caching is enabled)
- ✅ Optional signature verification (if your server returns a signature + public key)
- ✅ Tier-based access control
- ✅ Feature gating
- ✅ Device binding

## Online Validation

### `client.validation.validate(options)`

Validate a license key by communicating with the server.

**Parameters:**

```typescript
interface ValidateLicenseRequest {
  licenseKey: string; // License key to validate (required)
  deviceId: string; // Device fingerprint (required)
  requiredTier?: 'standard' | 'pro' | 'enterprise';
  requiredFeatures?: string[]; // Feature names to check
}
```

**Returns:** `Promise<ValidateLicenseResponse>`

```typescript
interface ValidateLicenseResponse {
  valid: boolean;
  license?: {
    licenseKey: string;
    tier: 'standard' | 'pro' | 'enterprise';
    features: Record<string, boolean>;
    maxUsers?: number;
    orgName: string;
    productCode: string;
    expiresAt: string;
    daysUntilExpiry?: number;
  };
  error?: string;
  reason?: string;
  currentTier?: 'standard' | 'pro' | 'enterprise';
  requiredTier?: 'standard' | 'pro' | 'enterprise';
  missingFeatures?: string[];

  // Optional signature fields (when your server signs validation payloads)
  signature?: string;
  signatureKid?: string;

  // Optional onboarding field (when your server supports ownership claims)
  ownerClaimed?: boolean;
}

// Common server reason values:
// - INVALID_KEY
// - REVOKED
// - SUSPENDED
// - EXPIRED
// - DEVICE_MISMATCH
// - INSUFFICIENT_TIER
// - MISSING_FEATURES
```

**Example: Basic Validation**

```typescript
import { LicenseClient, DeviceFingerprint } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: 'https://license-server.com/api',
});

const deviceId = await DeviceFingerprint.generate();

const result = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-A1B2-C3D4-E5F6',
  deviceId,
});

if (result.valid) {
  console.log('✅ License is valid');
  console.log('Organization:', result.license?.orgName);
} else {
  console.error('❌ Validation failed:', result.error);
}
```

**Example: Tier Validation**

```typescript
// Validate minimum tier requirement
const result = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-A1B2-C3D4-E5F6',
  deviceId,
  requiredTier: 'pro', // Require at least Pro tier
});

if (result.reason === 'TIER_INSUFFICIENT') {
  console.log(`Current tier: ${result.currentTier}`);
  console.log(`Required tier: ${result.requiredTier}`);
  // Note: the server uses INSUFFICIENT_TIER
  showUpgradePrompt(result.currentTier, result.requiredTier);
}
```

**Example: Feature Validation**

```typescript
// Validate specific features
const result = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-A1B2-C3D4-E5F6',
  deviceId,
  requiredFeatures: ['apiAccess', 'advancedReporting', 'webhooks'],
});

if (result.reason === 'MISSING_FEATURES') {
  console.log('Missing features:', result.missingFeatures);
  // ❌ Result: ['webhooks']
  showFeatureUpgradePrompt(result.missingFeatures);
}
```

## Offline-friendly patterns

The SDK does not expose a single `validateOffline(...)` method.

Instead, you typically combine:

1. **Cache-first validation** (fast UX, works during brief outages)
2. **Optional signature verification** (tamper resistance)

### 1) Cache-first validation

When caching is enabled, `client.validation.validate(...)` will cache successful results.

You can also check cached validity:

```ts
const isCachedValid = await client.validation.isValidCached(licenseKey);
```

This is an “offline-friendly” check (it does not cryptographically prevent tampering).

### 2) Signature verification (optional)

If your server returns a signature and provides a public key endpoint, you can verify the signature
locally.

The SDK exports `verifySignature(...)` from `@universal-license/core` and re-exports it from
`@universal-license/client`.

Example:

```ts
import { verifySignature } from '@universal-license/client';

// The payload must exactly match what the server signed.
const payload = JSON.stringify({
  licenseKey: result.license?.licenseKey,
  tier: result.license?.tier,
  deviceId,
  expiresAt: result.license?.expiresAt,
});

const publicKey = await client.validation.getPublicKey();
const ok = await verifySignature(payload, result.signature!, publicKey);

if (!ok) {
  throw new Error('Signature verification failed');
}
```

If you want offline signature checks, store the validated payload + signature + public key.

### Key rotation-aware public keys

If your server supports signing key rotation, use:

```ts
const keySet = await client.validation.getPublicKeySet();

// Typical shape:
// {
//   publicKey: string,        // legacy
//   kid?: string,             // current key id
//   keys?: Array<{ kid: string; publicKey: string }>
// }
```

## Validation Failures

### Handling Different Failure Reasons

```typescript
async function handleValidationFailure(result: ValidateLicenseResponse) {
  switch (result.reason) {
    case 'EXPIRED':
      // License has expired
      showRenewalPrompt();
      break;

    case 'REVOKED':
      // License was revoked by admin
      showErrorModal('Your license has been revoked');
      break;

    case 'INSUFFICIENT_TIER':
      // User tier doesn't meet requirement
      showUpgradePrompt(result.currentTier, result.requiredTier);
      break;

    case 'MISSING_FEATURES':
      // License doesn't have required features
      showFeatureUpgradePrompt(result.missingFeatures);
      break;

    case 'DEVICE_MISMATCH':
      // License is bound to different device
      showError('License is bound to a different device');
      break;

    case 'INVALID_KEY':
      // License key doesn't exist
      showError('License key not found');
      break;

    default:
      showError(result.error || 'Validation failed');
      break;
  }
}
```

## License object

The `License` object returned on successful validation:

```typescript
interface ValidatedLicense {
  licenseKey: string;
  tier: 'standard' | 'pro' | 'enterprise';
  features: Record<string, boolean>;
  maxUsers?: number;
  orgName: string;
  productCode: string;
  expiresAt: string;
  daysUntilExpiry?: number;
}
```

## Tier Hierarchy

Tiers are ordered by capability level:

```typescript
const TIER_HIERARCHY = {
  standard: 1, // Basic features
  pro: 2, // Advanced features
  enterprise: 3, // All features
};

// A Pro license satisfies Standard requirements
// An Enterprise license satisfies Pro and Standard requirements
```

## Caching

By default, validation results are cached:

```typescript
const client = new LicenseClient({
  baseUrl: 'https://license-server.com/api',
  cache: true, // Enable caching (default)
  cacheTTL: 3600000, // 1 hour in milliseconds
});

// First call hits server
await client.validation.validate({ licenseKey, deviceId });

// Second call uses cache (if within TTL)
await client.validation.validate({ licenseKey, deviceId });

// Clear cache manually
client.clearCache();
```

## Retry Logic

The SDK automatically retries failed requests with exponential backoff:

```typescript
const client = new LicenseClient({
  baseUrl: 'https://license-server.com/api',
  retries: 3, // Number of retry attempts
  timeout: 30000, // Timeout per request
});

// Retries automatically on:
// - Network timeouts
// - 5xx server errors
// - Connection refused

// Does NOT retry on:
// - 4xx client errors
// - Invalid license key
// - Validation failures
```

## Error Handling

```typescript
try {
  const result = await client.validation.validate({
    licenseKey: 'PROD-ORG-2025-A1B2-C3D4-E5F6',
    deviceId,
  });

  if (result.valid) {
    // Handle success
  } else {
    // Handle validation failure
    await handleValidationFailure(result);
  }
} catch (error) {
  // Network or SDK errors
  if (error.code === 'NETWORK_ERROR') {
    console.error('Network error:', error.message);
    // Try offline validation or use cached data
  } else if (error.code === 'TIMEOUT') {
    console.error('Request timed out');
    // Retry or use cached data
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Best Practices

✅ **Do:**

- Store validated license info in secure storage
- Revalidate periodically (e.g., daily)
- Use offline validation as fallback
- Handle all error cases gracefully
- Cache results to improve performance

❌ **Don't:**

- Store API responses without validation
- Skip tier/feature checks
- Ignore offline validation requirements
- Assume network always available
- Cache without TTL (time-to-live)

## See Also

- [LicenseClient API Reference](/api/client)
- [License Validation Guide](/guide/license-validation)
- [Error Handling](/guide/error-handling)
- [Offline Validation](/guide/offline-validation)
