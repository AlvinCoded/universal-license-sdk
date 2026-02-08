# License Validation

## Overview

License validation is the process of checking whether a license key is valid, active, and meets your
application's requirements. This is the most common operation you'll perform with the SDK.

## Basic Validation

### JavaScript/TypeScript

```javascript
import { LicenseClient, DeviceFingerprint } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: 'https://license.yourdomain.com/api',
});

const result = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: await DeviceFingerprint.generate(),
});

if (result.valid) {
  console.log(`✅ License valid for ${result.license.orgName}`);
  console.log(`Tier: ${result.license.tier}`);
} else {
  console.error(`❌ Validation failed: ${result.error}`);
}
```

The SDK automatically handles device fingerprint generation for your platform. This creates a unique
identifier that represents the current device without requiring user input.

### React

```jsx
import { useLicenseValidation } from '@universal-license/react';

export function LicenseActivation() {
  const [licenseKey, setLicenseKey] = useState('');
  const { validation, isLoading, error, validate } = useLicenseValidation();

  const handleValidate = async () => {
    await validate(licenseKey);
  };

  if (isLoading) return <div>Validating...</div>;

  return (
    <div>
      <input
        value={licenseKey}
        onChange={(e) => setLicenseKey(e.target.value)}
        placeholder="Enter license key"
      />
      <button onClick={handleValidate}>Activate</button>

      {validation?.valid && <p>Welcome {validation.license.orgName}!</p>}
      {validation && !validation.valid && <p>Error: {validation.error}</p>}
      {error && <p>Network error: {error.message}</p>}
    </div>
  );
}
```

The `useLicenseValidation` hook manages the validation state automatically. Once you call
`validate()`, it updates the component's state with the result, loading status, and any errors.

### PHP

```php
use UniversalLicense\LicenseClient;
use UniversalLicense\Validation\DeviceFingerprint;

$client = new LicenseClient([
    'baseUrl' => 'https://license.yourdomain.com/api'
]);

$result = $client->validation->validate([
    'licenseKey' => 'PROD-ORG-2025-XXXX-XXXX-XXXX',
    'deviceId' => DeviceFingerprint::generate()
]);

if ($result->valid) {
    echo "License valid for: " . $result->license->orgName;
    echo "Tier: " . $result->license->tier;
} else {
    echo "Validation failed: " . $result->error;
}
```

### Laravel

```php
use UniversalLicense\Facades\License;
use UniversalLicense\Validation\DeviceFingerprint;

$result = License::validate([
    'licenseKey' => request('license_key'),
    'deviceId' => DeviceFingerprint::generateForLaravel()
]);

if ($result->valid) {
    session(['license' => $result->license]);
    return redirect('/dashboard');
} else {
    return back()->with('error', 'License validation failed');
}
```

## Understanding the Response

When you validate a license, you receive a response with the following structure:

```javascript
{
    valid: true,  // or false if validation fails
    license: {
        licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
        tier: 'pro',
        status: 'active',
        orgName: 'Example Organization',
        productCode: 'PROD',
        issuedAt: '2025-01-15T00:00:00Z',
        expiresAt: '2026-01-15T00:00:00Z',
        maxUsers: 50,
        features: {
            memberManagement: true,
            advancedReporting: true,
            financialManagement: true
        }
    },
    error: null,  // Only present if validation fails
    reason: null  // Error reason code (e.g., 'EXPIRED', 'REVOKED')
}
```

The `valid` field tells you immediately whether the license is acceptable. If `valid` is true, the
`license` object contains all the information about that license. If false, the `error` field
explains what went wrong.

## Validation Checks

The SDK performs several checks when validating:

### 1. License Exists

The license key must exist in the system. If the key doesn't match any known license, validation
fails with `LICENSE_NOT_FOUND`.

### 2. License Status

The license status must be `active`. If the license is in any other state (pending, revoked,
expired), validation fails:

```javascript
// These statuses fail validation
- pending: License generated but not yet activated
- expired: License has passed its expiration date
- revoked: License was manually revoked
- suspended: License temporarily disabled
```

### 3. License Not Expired

The current date must be before the license's expiration date. The SDK automatically checks this:

```javascript
const result = await client.validation.validate({
  licenseKey: 'KEY',
  deviceId: 'device-123',
});

if (!result.valid && result.reason === 'EXPIRED') {
  showRenewalPrompt();
}
```

### 4. Device Binding

If the license is bound to a specific device, the device ID must match. Device binding prevents the
same license from being used on multiple devices.

```javascript
// If license is device-bound, this will fail on a different device
const result = await client.validation.validate({
  licenseKey: 'DEVICE-BOUND-KEY',
  deviceId: 'device-456', // Different from where license was bound
});

// result.valid === false, result.reason === 'DEVICE_MISMATCH'
```

## Conditional Validation

### Require Specific Tier

Only allow access if the license meets a minimum tier:

```javascript
const result = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: await DeviceFingerprint.generate(),
  requiredTier: 'pro',
});

if (!result.valid) {
  if (result.reason === 'TIER_INSUFFICIENT') {
    showUpgradePrompt(result.currentTier, result.requiredTier);
  }
}
```

The tier requirement uses a hierarchy: standard < pro < enterprise. A higher tier license can
satisfy a lower tier requirement, but not vice versa.

### Require Specific Features

Only allow access if the license has certain features enabled:

```javascript
const result = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: await DeviceFingerprint.generate(),
  requiredFeatures: ['advancedReporting', 'financialManagement'],
});

if (!result.valid && result.reason === 'MISSING_FEATURES') {
  console.log('Missing features:', result.missingFeatures);
  showFeatureUpgradePrompt();
}
```

All required features must be enabled in the license. If any are missing, validation fails and tells
you which ones are unavailable.

## Common Validation Scenarios

### Onboarding/First-Time Setup

When a user first activates your application, validate their license and store the result:

```javascript
async function onboardUser(licenseKey) {
  const result = await client.validation.validate({
    licenseKey,
    deviceId: await DeviceFingerprint.generate(),
    requiredTier: 'standard',
  });

  if (!result.valid) {
    throw new Error(`License validation failed: ${result.error}`);
  }

  // Store license information for later use
  localStorage.setItem('licenseKey', licenseKey);
  localStorage.setItem('organizationName', result.license.orgName);
  localStorage.setItem('licenseTier', result.license.tier);
  localStorage.setItem('licenseFeatures', JSON.stringify(result.license.features));

  return result.license;
}
```

### Periodic Re-validation

Periodically check that the license is still valid (useful for detecting revocation or expiration):

```javascript
async function revalidateLicense() {
  const licenseKey = localStorage.getItem('licenseKey');

  const result = await client.validation.validate({
    licenseKey,
    deviceId: await DeviceFingerprint.generate(),
  });

  if (!result.valid) {
    // License became invalid - show renewal/error UI
    handleInvalidLicense(result.error);
  }

  return result;
}

// Call periodically
setInterval(revalidateLicense, 24 * 60 * 60 * 1000); // Daily
```

### Feature-Dependent Actions

Check features before allowing specific actions:

```javascript
async function attemptAdvancedReport() {
  const licenseKey = localStorage.getItem('licenseKey');

  const result = await client.validation.validate({
    licenseKey,
    deviceId: await DeviceFingerprint.generate(),
    requiredFeatures: ['advancedReporting'],
  });

  if (!result.valid) {
    showUpgradePrompt('Advanced reporting requires Pro tier or higher');
    return;
  }

  // Feature is available - show advanced reporting UI
  showAdvancedReporting();
}
```

## Error Handling

Validation can fail for several reasons. Always handle both network errors and validation failures:

```javascript
import { ValidationError, NetworkError } from '@universal-license/client';

try {
  const result = await client.validation.validate({
    licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
    deviceId: await DeviceFingerprint.generate(),
  });

  if (!result.valid) {
    // Validation failed - license is invalid/expired/revoked
    switch (result.reason) {
      case 'LICENSE_NOT_FOUND':
        console.error('License key does not exist');
        break;
      case 'EXPIRED':
        console.error('License has expired');
        break;
      case 'REVOKED':
        console.error('License was revoked');
        break;
      case 'DEVICE_MISMATCH':
        console.error('License bound to different device');
        break;
      case 'TIER_INSUFFICIENT':
        console.error(`Requires ${result.requiredTier}, license is ${result.currentTier}`);
        break;
      case 'MISSING_FEATURES':
        console.error('Missing features:', result.missingFeatures);
        break;
    }
  } else {
    // Success - license is valid
    console.log('License valid:', result.license);
  }
} catch (error) {
  if (error instanceof NetworkError) {
    // Network error - no internet or server unreachable
    console.error('Cannot reach license server');
    // Fall back to cached validation if available
  } else if (error instanceof ValidationError) {
    // SDK validation error (malformed request, etc.)
    console.error('Validation error:', error.message);
  } else {
    // Unknown error
    console.error('Unexpected error:', error);
  }
}
```

## Offline Validation

The SDK can validate licenses using cached data when the network is unavailable:

```javascript
// This uses cache if available, falls back to network if not
const result = await client.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: await DeviceFingerprint.generate(),
});

// For offline-only validation (no network calls)
const isValidOffline = await client.validation.isValidCached('PROD-ORG-2025-XXXX-XXXX-XXXX');
if (!isValidOffline) {
  console.error('Offline validation not available (no cache)');
}
```

Cached validation is faster and works without internet, but the data is only as fresh as the cache
TTL allows. After the cache expires, fresh data must be fetched from the server.

## Performance Tips

### 1. Validate Once, Store Result

Don't validate the same license multiple times. Validate once on startup and store the result:

```javascript
// ✅ Good
const result = await client.validation.validate({ licenseKey, deviceId });
localStorage.setItem('validationResult', JSON.stringify(result));

// Later, use cached result for feature checks
const result = JSON.parse(localStorage.getItem('validationResult'));
if (result.license.features.reporting) {
  showReporting();
}

// ❌ Avoid - validating every time
for (let i = 0; i < 100; i++) {
  const result = await client.validation.validate({ licenseKey, deviceId });
}
```

### 2. Use Caching

Enable caching in SDK configuration to avoid repeated API calls:

```javascript
const client = new LicenseClient({
  baseUrl: 'https://license.yourdomain.com/api',
  cache: true, // Enable caching
  cacheTTL: 3600000, // Cache for 1 hour (milliseconds)
});

// First call hits API
const result1 = await client.validate({ licenseKey, deviceId });

// Second call within 1 hour uses cache (much faster)
const result2 = await client.validate({ licenseKey, deviceId });
```

### 3. Validate on Demand, Not on Every Request

For web applications, validate during onboarding and periodically, not on every page load:

```javascript
// ✅ Good - validate once during setup
app.use(async (req, res, next) => {
    if (!req.session.licenseValidated) {
        const result = await client.validation.validate({ ... });
        req.session.licenseValidated = result.valid;
    }
    next();
});

// ❌ Avoid - validating on every request
app.use(async (req, res, next) => {
    const result = await client.validation.validate({ ... });
    next();
});
```

## Next Steps

- [Device Fingerprinting](/guide/device-fingerprinting) - Understanding device IDs
- [Tier-Based Access](/guide/tier-based-access) - Managing different license tiers
- [Feature Gating](/guide/feature-gating) - Controlling individual features
- [Error Handling](/guide/error-handling) - Comprehensive error strategies
