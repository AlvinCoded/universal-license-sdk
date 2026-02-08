# Why Use This SDK?

## The Problem: Raw API Calls

If you're making direct HTTP requests to your license server, you're likely repeating code:

```javascript
// Without SDK - lots of boilerplate
async function validateLicense(licenseKey, deviceId) {
  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      const response = await fetch('https://your-server.com/api/licenses/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey, deviceId }),
      });

      const data = await response.json();

      // Check response format
      if (data.valid) {
        return { valid: true, license: data.license };
      } else {
        return { valid: false, error: data.error };
      }
    } catch (error) {
      retries++;
      if (retries === maxRetries) throw error;
      // Exponential backoff
      await new Promise((r) => setTimeout(r, Math.pow(2, retries) * 1000));
    }
  }
}
```

## The Solution: Universal License SDK

```javascript
// With SDK - simple and consistent
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
});

const result = await client.validation.validate({
  licenseKey,
  deviceId,
});
```

## Key Benefits

### 1. **Automatic Retry Logic**

The SDK automatically retries failed requests with exponential backoff:

- Network errors: Retried automatically
- Server errors (5xx): Retried with increasing delays
- Client errors (4xx): Returned immediately (no retry)

You don't need to implement this yourself.

### 2. **Built-in Caching**

GET requests are automatically cached:

```javascript
// First call: Hits API
const products = await client.products.getAll();

// Second call: Returns cached result (within TTL)
const products = await client.products.getAll();
```

Cache behavior:

- **Default TTL:** 1 hour
- **Configurable:** Per request or globally
- **Persistent:** File-based (PHP) or memory (JS)
- **Offline support:** Works without internet

### 3. **Consistent Response Handling**

All modules use the same response format:

```javascript
// Every module returns the same response type
const response = await client.licenses.get(licenseKey);

// Access data consistently
response.get('license.tier'); // Dot notation
response.get('license.tier', 'standard'); // With defaults
response.has('license.features'); // Check existence
response.toArray(); // Convert to object
```

### 4. **Type Safety (TypeScript)**

Full TypeScript support with proper typing:

```typescript
import { LicenseClient, ValidationResult } from '@universal-license/client';

const client = new LicenseClient({ baseUrl: '...' });

// Fully typed response
const result: ValidationResult = await client.validation.validate({
  licenseKey: '...',
  deviceId: '...',
});

// IDE autocomplete and type checking
if (result.valid) {
  const tier: string = result.license.tier; // ✅ Type-safe
  const users: number = result.license.maxUsers;
}
```

### 5. **Framework Integration**

Ready-to-use integrations for popular frameworks:

#### React

```jsx
import { LicenseGuard, FeatureGate, useLicenseValidation } from '@universal-license/react';

// Hooks
const { validation, loading, validate } = useLicenseValidation();
await validate(licenseKey);

// Components
<LicenseGuard licenseKey={licenseKey} fallback={<UpgradePrompt />}>
    <ProtectedFeature />
</LicenseGuard>

<FeatureGate feature="reporting" fallback={<UpgradePrompt />}>
    <ReportingUI />
</FeatureGate>
```

#### Laravel

```php
// Middleware
Route::get('/admin', AdminController::class)
    ->middleware(['license', 'license.tier:pro']);

// Facade
try {
    $result = License::validate([
        'licenseKey' => $key,
        'deviceId' => DeviceFingerprint::generateForLaravel(),
        'requiredTier' => 'pro',
    ]);

    if ($result->valid) {
        // ...
    }
} catch (\UniversalLicense\Exceptions\LicenseException $e) {
    // Handle validation/API errors
}

// Artisan commands
php artisan license:validate PROD-ORG-2025-XXXX-XXXX-XXXX
```

#### WordPress

```php
use UniversalLicense\LicenseClient;
use UniversalLicense\Validation\DeviceFingerprint;

add_filter('init', function() {
    $client = new LicenseClient([
        'baseUrl' => get_option('uls_api_base_url'),
        'cache' => true,
    ]);

    $licenseKey = get_option('license_key');
    if (!$licenseKey) {
        wp_die('License missing');
    }

    $result = $client->validation->validateWithCache(
        $licenseKey,
        DeviceFingerprint::generateForWordPress(),
        3600
    );

    if (!$result->valid) {
        wp_die('License invalid');
    }
});
```

### 6. **Device Fingerprinting**

The SDK automatically generates platform-specific device IDs:

```javascript
// JavaScript - Browser
const deviceId = await DeviceFingerprint.generate();
// Uses: user agent, screen resolution, timezone, etc.

// Node.js
const deviceId = await DeviceFingerprint.generate();
// Uses: hostname, node version, platform info

// PHP
$deviceId = DeviceFingerprint::generate();
// Uses: hostname, PHP version, server info

// WordPress
$deviceId = DeviceFingerprint::generateForWordPress();
// Uses: WP paths, database name, siteurl

// Laravel
$deviceId = DeviceFingerprint::generateForLaravel();
// Uses: Laravel paths, app name, database info
```

No manual fingerprinting needed.

### 7. **Offline Validation**

Validate licenses without internet using cached data:

```javascript
import { verifySignature } from '@universal-license/client';

// First validation (requires internet)
const result = await client.validate({
  licenseKey,
  deviceId,
});

// Later: offline-only cached check
const isValidOffline = await client.validation.isValidCached(licenseKey);

// For maximum security, verify RSA signature
if (await verifySignature(licenseData, signature, publicKey)) {
  // License data is authentic
}
```

### 8. **Error Handling**

Proper error types for different scenarios:

```javascript
import { ValidationError, NetworkError } from '@universal-license/client';

try {
  const result = await client.validate({ licenseKey, deviceId });
} catch (error) {
  if (error instanceof ValidationError) {
    // License validation failed (expired, revoked, etc.)
    console.error('Validation failed:', error.message);
  } else if (error instanceof NetworkError) {
    // Network error (connection timeout, etc.)
    console.error('Network error:', error.message);
  }
}
```

### 9. **Admin Operations**

Manage licenses programmatically:

```javascript
// Generate licenses
const license = await client.licenses.generate({
  planCode: 'PROD-PRO',
  organizationData: {
    orgName: 'Example Organization',
    ownerName: 'Jane Doe',
    ownerEmail: 'owner@example.com',
  },
});

// Renew licenses
const renewed = await client.renewals.renew({
  licenseKey,
  durationDays: 365,
  paymentReference: 'pi_...',
});

// Get statistics
const stats = await client.licenses.getStats();
console.log(`Total revenue: $${stats.revenue.total}`);

// Track upcoming renewals
const renewals = await client.licenses.getUpcomingRenewals(30);
```

### 10. **Consistent Across Platforms**

Same API, different languages:

```javascript
// JavaScript
const result = await client.validation.validate({ licenseKey, deviceId });

// TypeScript - Exact same API
const result = await client.validation.validate({ licenseKey, deviceId });

// React - Hooks version
const { validation, validate } = useLicenseValidation();
await validate(licenseKey);

// PHP
$result = $client->validation->validate(['licenseKey' => $key, 'deviceId' => $id]);

// Laravel
$result = License::validate(['licenseKey' => $key, 'deviceId' => $id]);
```

Learn once, apply everywhere.

## Real-World Comparison

### Scenario: License Validation in Product Onboarding

#### Without SDK (Manual API calls)

```typescript
export async function validateLicenseOnboarding(licenseKey: string) {
  // Need to import fetch, set up error handling
  // Need to generate device ID somehow
  // Need to handle retries manually
  // Need to implement caching if desired
  // Need to validate response format

  const baseUrl = process.env.REACT_APP_LICENSE_SERVER;
  const deviceId = generateDeviceFingerprint(); // Custom function needed

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/api/licenses/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ licenseKey, deviceId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Validate response format
      if (!data.valid || !data.license) {
        throw new Error('Invalid response format');
      }

      // Cache result manually
      localStorage.setItem('cachedLicense', JSON.stringify(data.license));

      return { valid: true, license: data.license };
    } catch (error) {
      lastError = error as Error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError || new Error('Failed to validate license');
}
```

#### With SDK (Simple and clean)

```typescript
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: process.env.REACT_APP_LICENSE_SERVER,
  cache: true,
});

export async function validateLicenseOnboarding(licenseKey: string) {
  const result = await client.validation.validate({
    licenseKey,
    // Device fingerprint generated automatically
  });

  return result;
}
```

**Benefits:**

- 70% less code
- Automatic device fingerprinting
- Automatic retry logic
- Built-in caching
- Type-safe response
- Consistent error handling

## When SDK Shines

### Multi-Platform Applications

Same business logic across web, mobile, and server-side services:

```
Frontend (React)    → Uses SDK via npm
Server (Node.js)   → Uses SDK via npm
Mobile (React Native) → Uses SDK via npm
Desktop (Electron)  → Uses SDK via npm
```

### Enterprise Applications

Multiple products, multiple tiers, complex licensing:

```javascript
// Validate with all constraints
const result = await client.validation.validate({
  licenseKey,
  deviceId,
  requiredTier: 'enterprise',
  requiredFeatures: ['reporting', 'audit', 'sso'],
});

if (!result.valid) {
  // Gracefully handle insufficient license
  showUpgradePrompt(result.currentTier, result.requiredTier);
}
```

### Long-Running Services

Background jobs that need license checking:

```php
// Laravel background job
class CheckLicenseExpiry implements ShouldQueue {
    public function handle() {
        $renewals = License::getUpcomingRenewals(30);

        foreach ($renewals as $license) {
            // Send renewal reminders
        }
    }
}
```

## Conclusion

Use the **Universal License SDK** because:

✅ **Saves time** - Less boilerplate code  
✅ **Reliable** - Built-in retry and error handling  
✅ **Performant** - Automatic caching  
✅ **Type-safe** - Full TypeScript support  
✅ **Convenient** - Framework integrations  
✅ **Consistent** - Same API across languages  
✅ **Offline-capable** - Works without internet  
✅ **Production-ready** - Used in real applications

---

## Next Steps

- **Ready to get started?** → [Installation](/installation/javascript)
- **Want to see it in action?** → [Getting Started](/getting-started)
- **Prefer examples?** → [Examples](/examples/)
