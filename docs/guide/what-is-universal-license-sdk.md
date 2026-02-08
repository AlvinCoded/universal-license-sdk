# What is Universal License SDK?

## Overview

The **Universal License SDK** is a comprehensive, multi-language client library for integrating
license validation, management, and subscription functionality into your applications. It provides a
unified interface across JavaScript/TypeScript, React, PHP, and Laravel, allowing you to implement
licensing with minimal setup.

## Why This SDK?

Rather than making raw API calls to your license server, this SDK provides:

- **Type-safe** abstractions (especially for TypeScript/PHP projects)
- **Automatic retry logic** with exponential backoff
- **Response caching** for improved performance
- **Device fingerprinting** for license binding
- **Offline validation** support with RSA signature verification
- **Framework-specific integrations** (React hooks, Laravel middleware, WordPress plugins)
- **Consistent API** across all supported languages

## Supported Languages & Frameworks

### JavaScript/TypeScript

- **Vanilla JavaScript** applications
- **TypeScript** projects with full type definitions
- **Node.js** services
- Browser-based SPAs

### React

- **React 16.8+** with hooks
- **Next.js** applications
- **Vite** projects
- Context providers for global license state

### PHP

- **Vanilla PHP 8.0+** applications
- **WordPress** plugins and themes
- **Laravel 9+** applications
- **Symfony 5+** projects
- **Composer**-based projects

## Core Features

### License Validation

Validate license keys in real-time with your license server:

```javascript
const result = await client.validation.validate({
  licenseKey: 'YOUR-LICENSE-KEY',
  deviceId: generateDeviceFingerprint(),
  requiredTier: 'pro',
});

if (result.valid) {
  // License is valid - enable features
}
```

### Device Fingerprinting

Generate unique device identifiers for:

- Device binding
- License tracking
- Usage analytics

Supports:

- Web browsers (JavaScript)
- Node.js servers
- PHP servers (auto-detects server environment)
- WordPress installations
- Laravel applications

### Subscription Management

Manage the complete purchase-to-license lifecycle:

1. Create purchase orders
2. Process payments
3. Auto-generate licenses
4. Track renewals
5. Handle grace periods

### Feature Gating

Control feature access based on:

- License tier (standard, pro, enterprise)
- Individual features (enabled/disabled)
- Maximum users
- Device binding

```javascript
// Check tier requirement
if (license.tier === 'pro') {
  enableAdvancedReporting();
}

// Check specific features
if (license.features.multiLocation) {
  showMultiLocationUI();
}

// Check user limit
if (activeUsers < license.maxUsers) {
  allowNewUser();
}
```

### Offline Support

Validate licenses locally using cached data:

- Verify RSA signatures for authenticity
- No internet required after initial validation
- Automatic sync when connection restored

### Error Handling

Comprehensive error types for different scenarios:

- Network errors (retried automatically)
- Validation failures (expired, revoked, invalid)
- Feature/tier mismatches
- Device binding conflicts

## Quick Example

### JavaScript/TypeScript

```javascript
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: 'https://your-license-server.com/api',
  cache: true,
});

// Validate license
const validation = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: await DeviceFingerprint.generate(),
});

if (validation.valid) {
  console.log(`License valid for: ${validation.license.orgName}`);
  console.log(`Tier: ${validation.license.tier}`);
  console.log(`Features:`, validation.license.features);
}
```

### React

```jsx
import { useLicenseValidation } from '@universal-license/react';

export function App() {
  const { validation, loading, error, validate } = useLicenseValidation();

  React.useEffect(() => {
    void validate('YOUR-LICENSE-KEY');
  }, [validate]);

  if (loading) return <div>Validating license...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!validation?.valid) {
    return <div>License is invalid. Please renew.</div>;
  }

  return <YourApp license={validation.license} />;
}
```

### PHP

```php
use UniversalLicense\LicenseClient;
use UniversalLicense\Validation\DeviceFingerprint;

$client = new LicenseClient([
    'baseUrl' => 'https://your-license-server.com/api'
]);

$result = $client->validation->validate([
    'licenseKey' => 'PROD-ORG-2025-XXXX-XXXX-XXXX',
    'deviceId' => DeviceFingerprint::generate()
]);

if ($result->valid) {
    echo "License is valid! Tier: " . $result->license->tier;
}
```

### Laravel

```php
use UniversalLicense\Facades\License;

// In your controller
$validation = License::validate([
    'licenseKey' => request('license_key'),
    'deviceId' => DeviceFingerprint::generate()
]);

if ($validation->valid) {
    // License is valid
    session(['license' => $validation->license]);
}
```

## When to Use This SDK

✅ **Use the SDK when:**

- You're building a new application with licensing
- You want framework-specific integrations (React hooks, Laravel middleware)
- You need automatic retry and caching logic
- You want consistent behavior across multiple platforms
- Your application is written in JS/TS, React, PHP, or Laravel

✅ **You can use direct API calls if:**

- You're building a simple, one-off integration
- You have specific requirements not covered by the SDK
- You prefer minimal dependencies

**We recommend using the SDK** - it handles edge cases, retries, and platform-specific logic so you
don't have to.

## Architecture

The SDK follows a modular architecture:

```
LicenseClient (entry point)
  ├── ValidationModule (validate licenses)
  ├── LicenseModule (manage licenses - admin)
  ├── ProductModule (manage products)
  └── PurchaseModule (manage purchases)
      ├── HttpClient (API communication)
      ├── Response (response wrapper)
      └── Cache (offline data storage)
```

Each module is **optional** - import only what you need:

```javascript
// Import just validation
import { ValidationModule } from '@universal-license/client';

// Or the full client
import { LicenseClient } from '@universal-license/client';
```

## Next Steps

- **New to licensing?** → See [Core Concepts](/guide/core-concepts)
- **Ready to integrate?** → Choose your [Installation](/installation/javascript) guide
- **Want examples?** → Browse [Examples](/examples/basic-validation)
- **Need API details?** → Check [API Reference](/api/)
