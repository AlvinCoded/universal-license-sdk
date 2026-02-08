# Getting Started

Get up and running with the Universal License SDK in minutes.

## Why Use This SDK?

<div class="why-use">

### 🎯 **Simplified Integration**

Instead of manually handling HTTP requests, retries, and error states, use a single line of code to
validate licenses.

### 🔒 **Security First**

Built-in RSA signature verification, device fingerprinting, and encryption ensure your licensing is
secure.

### ⚡ **Performance**

Automatic caching and smart retry logic reduce API calls and improve user experience.

### 🛠️ **Developer Experience**

Full TypeScript support, comprehensive documentation, and working examples make integration a
breeze.

</div>

## Prerequisites

- Node.js >= 18
- npm, pnpm, or yarn

## Installation

Choose your preferred package manager:

::: code-group

```bash [npm]
# JavaScript/TypeScript SDK
npm install @universal-license/client

# React hooks and components (optional)
npm install @universal-license/react @universal-license/client
```

```bash [pnpm]
# JavaScript/TypeScript SDK
pnpm add @universal-license/client

# React hooks and components (optional)
pnpm add @universal-license/react @universal-license/client
```

```bash [yarn]
# JavaScript/TypeScript SDK
yarn add @universal-license/client

# React hooks and components (optional)
yarn add @universal-license/react @universal-license/client
```

:::

## Your First License Validation

### Step 1: Initialize the Client

```typescript
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: 'https://your-license-server.com/api',
  // Required for public endpoints (e.g. license validation)
  appKey: 'YOUR_APP_KEY',
  cache: true, // Enable caching (recommended)
  timeout: 30000, // 30 seconds
  debug: true, // Enable debug logging (development only)
});
```

### Step 2: Generate Device Fingerprint

```typescript
import { DeviceFingerprint } from '@universal-license/client';

// Generate unique device identifier
const deviceId = await DeviceFingerprint.generate();

console.log(deviceId); // "abc123def456..." (64-char SHA-256 hash)
```

### Step 3: Validate License

```typescript
const result = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId,
  requiredTier: 'standard', // Optional: minimum tier required
  requiredFeatures: ['memberManagement'], // Optional: required features
});

if (result.valid) {
  console.log('✅ License is valid!');
  console.log('Organization:', result.license?.orgName);
  console.log('Tier:', result.license?.tier);
  console.log('Expires:', result.license?.expiresAt);

  // Store license info
  localStorage.setItem('licenseKey', result.license?.licenseKey);
  localStorage.setItem('licenseTier', result.license?.tier);

  // Enable application features
  enableFeatures(result.license?.features);
} else {
  console.error('❌ License validation failed:', result.error);

  // Handle different error cases
  if (result.reason === 'EXPIRED') {
    showRenewalPrompt();
  } else if (result.reason === 'TIER_INSUFFICIENT') {
    showUpgradePrompt(result.currentTier, result.requiredTier);
  }
}
```

## Complete Example

Here's a complete example of integrating license validation into your application's onboarding flow:

```typescript
// src/onboarding.ts
import { LicenseClient, DeviceFingerprint } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: process.env.VITE_LICENSE_API_URL!,
  cache: true,
});

async function validateAndActivateLicense(licenseKey: string) {
  try {
    // Show loading state
    showLoadingSpinner();

    // Generate device fingerprint
    const deviceId = await DeviceFingerprint.generate();

    // Validate license
    const result = await client.validation.validate({
      licenseKey,
      deviceId,
      requiredTier: 'standard',
      requiredFeatures: ['memberManagement', 'attendance'],
    });

    if (result.valid) {
      // Store license info
      localStorage.setItem('licenseKey', licenseKey);
      localStorage.setItem('licenseTier', result.license!.tier);
      localStorage.setItem('licenseFeatures', JSON.stringify(result.license!.features));
      localStorage.setItem('organizationName', result.license!.orgName);

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      // Show error message
      showError(result.error || 'License validation failed');

      // Handle specific error cases
      switch (result.reason) {
        case 'EXPIRED':
          showRenewalDialog(licenseKey);
          break;
        case 'TIER_INSUFFICIENT':
          showUpgradeDialog(result.currentTier, result.requiredTier);
          break;
        case 'MISSING_FEATURES':
          showFeatureUpgradeDialog(result.missingFeatures);
          break;
        default:
          showContactSupport();
      }
    }
  } catch (error) {
    console.error('Validation error:', error);
    showError('Network error. Please check your connection and try again.');
  } finally {
    hideLoadingSpinner();
  }
}

// Usage in your form
document.getElementById('activateButton')?.addEventListener('click', async () => {
  const licenseKey = (document.getElementById('licenseInput') as HTMLInputElement).value;
  await validateAndActivateLicense(licenseKey);
});
```

## React Integration

For React applications, use the provided hooks for a cleaner implementation:

```tsx
import { LicenseProvider, useLicenseValidation } from '@universal-license/react';

// Wrap your app
function App() {
  return (
    <LicenseProvider config={{ baseUrl: process.env.REACT_APP_LICENSE_API_URL! }}>
      <OnboardingPage />
    </LicenseProvider>
  );
}

// Use in components
function OnboardingPage() {
  const [licenseKey, setLicenseKey] = useState('');
  const { validate, validation, loading, error } = useLicenseValidation();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await validate(licenseKey, {
      requiredTier: 'standard',
      requiredFeatures: ['memberManagement'],
    });

    if (result.valid) {
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={licenseKey}
        onChange={(e) => setLicenseKey(e.target.value)}
        placeholder="Enter license key"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Validating...' : 'Activate License'}
      </button>

      {error && <p className="error">{error}</p>}
      {validation && !validation.valid && <p className="error">{validation.error}</p>}
    </form>
  );
}
```

## Next Steps

Now that you have basic validation working:

1. **[Feature Gating](/guide/feature-gating)** - Control access based on license tier and features
2. **[Purchase Workflow](/guide/purchase-workflow)** - Integrate purchases and provisioning
3. **[Renewal Management](/guide/renewal-management)** - Handle license renewals
4. **[Offline Validation](/guide/offline-validation)** - Cache-first validation and optional
   signature verification
5. **[Error Handling](/guide/error-handling)** - Handle different error scenarios

## Common Patterns

### Store License Info After Validation

```typescript
if (result.valid) {
  const license = result.license!;

  // Store in localStorage
  localStorage.setItem('licenseKey', license.licenseKey);
  localStorage.setItem('licenseTier', license.tier);
  localStorage.setItem('licenseFeatures', JSON.stringify(license.features));

  // Store in your state management (Redux, Zustand, etc.)
  store.dispatch(setLicense(license));
}
```

### Periodic Revalidation

```typescript
// Revalidate license every 24 hours
setInterval(
  async () => {
    const licenseKey = localStorage.getItem('licenseKey');
    const deviceId = await DeviceFingerprint.generate();

    const result = await client.validation.validate({ licenseKey, deviceId });

    if (!result.valid) {
      // License expired or revoked
      localStorage.clear();
      window.location.href = '/renew';
    }
  },
  24 * 60 * 60 * 1000
); // 24 hours
```

### Feature Access Check

```typescript
function hasFeature(featureName: string): boolean {
  const features = JSON.parse(localStorage.getItem('licenseFeatures') || '{}');
  return features[featureName] === true;
}

// Usage
if (hasFeature('advancedReporting')) {
  showAdvancedReports();
} else {
  showUpgradePrompt();
}
```

## Troubleshooting

### Network Errors

If you're getting network errors, check:

1. ✅ `baseUrl` is correct and accessible
2. ✅ CORS is configured on your license server
3. ✅ License server is running and healthy (`/api/health`)

```typescript
// Test server connection
const health = await client.testConnection();
console.log('Server healthy:', health.healthy);
```

### Invalid License Key

If validation always fails:

1. ✅ License key format is correct (e.g., `PROD-ORG-2025-XXXX-XXXX-XXXX`)
2. ✅ License exists in your server's database
3. ✅ License status is "active" (not expired/revoked)
4. ✅ Device ID is consistent across requests

### TypeScript Errors

If you're getting type errors:

```bash
# Make sure you have TypeScript installed
npm install -D typescript @types/node

# Regenerate types
npm run typecheck
```

## Support

Helpful next links:

- [API Overview](/api/) - Endpoint and module overview
- [Guide Index](/guide/getting-started) - Step-by-step tutorials
- [Examples](/examples/) - Working end-to-end flows
- [Troubleshooting](/troubleshooting) - Common setup and runtime issues

---

**Ready to integrate?** Check out the [API Reference](/api/) for complete documentation.
