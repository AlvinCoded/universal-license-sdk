# Getting Started

## Installation

Choose your platform and install the SDK:

### JavaScript/TypeScript

```bash
npm install @unilic/client
# or
yarn add @unilic/client
# or
pnpm add @unilic/client
```

### React

```bash
npm install @unilic/react @unilic/client
# or
yarn add @unilic/react @unilic/client
```

React package provides hooks and components for convenient integration.

### PHP

```bash
composer require universal-license/php-client
```

### Laravel

```bash
composer require universal-license/php-client
```

Then publish configuration:

```bash
php artisan vendor:publish --provider="UniversalLicense\Laravel\LicenseServiceProvider"
```

## Basic Setup

### JavaScript/TypeScript

```typescript
import { LicenseClient, DeviceFingerprint } from '@unilic/client';

const client = new LicenseClient({
  baseUrl: 'https://license.yourdomain.com/api',
});

// Now you can validate licenses
const result = await client.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: await DeviceFingerprint.generate(),
});

if (result.valid) {
  console.log('License is valid!');
}
```

### React

Wrap your app with the provider:

```tsx
import { LicenseProvider } from '@unilic/react';

function App() {
  return (
    <LicenseProvider
      config={{
        baseUrl: process.env.REACT_APP_LICENSE_API_URL,
        cache: true,
      }}
    >
      <YourAppComponents />
    </LicenseProvider>
  );
}
```

Then use hooks in your components:

```tsx
import { useLicenseValidation } from '@unilic/react';

function MyComponent() {
  const { validate, validation, loading } = useLicenseValidation();

  return (
    <div>
      <button onClick={() => validate('LICENSE-KEY')}>Validate</button>
      {validation?.valid && <p>Valid!</p>}
    </div>
  );
}
```

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
    echo "License is valid!";
}
```

### Laravel

```php
use UniversalLicense\Facades\License;

$result = License::validate([
    'licenseKey' => request('license_key'),
    'deviceId' => request('device_id')
]);

if ($result->valid) {
    return response()->json(['success' => true]);
}
```

## Configuration

The SDK needs your API endpoint URL:

```javascript
const client = new LicenseClient({
  baseUrl: 'https://license.yourdomain.com/api', // Required
  cache: true, // Optional
  timeout: 30000, // Optional (ms)
  retries: 3, // Optional
});
```

For production, use environment variables:

```javascript
// .env
VITE_LICENSE_API_URL=https://license.yourdomain.com/api

// config.ts
const client = new LicenseClient({
    baseUrl: import.meta.env.VITE_LICENSE_API_URL
});
```

## Your First Request

### Validate a License

```javascript
try {
  const result = await client.validate({
    licenseKey: 'YOUR-LICENSE-KEY-HERE',
    deviceId: 'device-123',
  });

  if (result.valid) {
    console.log('✅ License valid!');
    console.log('Tier:', result.license.tier);
    console.log('Expires:', result.license.expiresAt);
  } else {
    console.log('❌ License invalid:', result.error);
  }
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

This makes a request to validate the license and returns detailed information about its status.

### Get License Information

```javascript
// After validation, access license details
const license = result.license;

console.log('Organization:', license.orgName);
console.log('Product:', license.productCode);
console.log('Tier:', license.tier);
console.log('Status:', license.status);
console.log('Features:', license.features);
console.log('Max Users:', license.maxUsers);
```

### Check Features

```javascript
const hasAdvancedReporting = result.license.features.advancedReporting;

if (hasAdvancedReporting) {
  showAdvancedReportingUI();
} else {
  showBasicReportingUI();
}
```

## Common Patterns

### Onboarding Flow

When a user first activates your application with their license:

```typescript
async function onboardUser(licenseKey: string) {
  try {
    // Validate license
    const result = await client.validate({
      licenseKey,
      deviceId: await DeviceFingerprint.generate(),
      requiredTier: 'standard',
    });

    if (!result.valid) {
      throw new Error(`License invalid: ${result.error}`);
    }

    // Store license information
    localStorage.setItem('licenseKey', licenseKey);
    localStorage.setItem('licenseFeatures', JSON.stringify(result.license.features));
    localStorage.setItem('licenseTier', result.license.tier);
    localStorage.setItem('orgName', result.license.orgName);

    // Enable appropriate features
    enableFeatures(result.license.features);

    return result.license;
  } catch (error) {
    handleError(error);
  }
}
```

### Feature-Based Access

Control your app's features based on the license:

```javascript
function canUseFeature(featureName) {
  const features = JSON.parse(localStorage.getItem('licenseFeatures') || '{}');
  return features[featureName] === true;
}

// Use in your app
if (canUseFeature('advancedReporting')) {
  showAdvancedReports();
} else {
  showBasicReports();
}
```

### Periodic Revalidation

Check periodically that the license is still valid (detects expiration, revocation, etc.):

```javascript
async function revalidateLicense() {
  const licenseKey = localStorage.getItem('licenseKey');
  if (!licenseKey) return;

  try {
    const result = await client.validate({
      licenseKey,
      deviceId: await DeviceFingerprint.generate(),
    });

    if (!result.valid) {
      // License became invalid
      handleExpiredLicense(result.error);
    } else {
      // Update stored features in case they changed
      localStorage.setItem('licenseFeatures', JSON.stringify(result.license.features));
    }
  } catch (error) {
    console.error('Revalidation failed:', error);
  }
}

// Revalidate daily
setInterval(revalidateLicense, 24 * 60 * 60 * 1000);
```

## Error Handling

Always handle errors gracefully:

```javascript
import { ValidationError, NetworkError } from '@unilic/client';

try {
  const result = await client.validate({
    licenseKey: 'KEY',
    deviceId: 'device-123',
  });
} catch (error) {
  if (error instanceof ValidationError) {
    // License validation failed (invalid, expired, etc.)
    showMessage('License is not valid');
  } else if (error instanceof NetworkError) {
    // Network error (no internet, server down, etc.)
    showMessage('Cannot reach license server');
  } else {
    // Unknown error
    showMessage('An error occurred');
  }
}
```

## Next Steps

Now that you're set up, explore more features:

1. **[License Validation](/guide/license-validation)** - Comprehensive validation options
2. **[Feature Gating](/guide/feature-gating)** - Control features by license
3. **[Tier-Based Access](/guide/tier-based-access)** - Manage license tiers
4. **[Purchase Workflow](/guide/purchase-workflow)** - Handle purchases and licenses
5. **[Error Handling](/guide/error-handling)** - Robust error management
6. **[Configuration](/config/sdk-config)** - Advanced SDK options
