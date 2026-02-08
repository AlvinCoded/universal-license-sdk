# @universal-license/react

React hooks and components for Universal License SDK.

## Why This Package?

While `@universal-license/client` works in any JavaScript environment, this package provides
**React-specific conveniences**:

✅ **Hooks** - React-friendly state management with automatic caching  
✅ **Context** - Share SDK client across your app via React Context  
✅ **Components** - Pre-built guards and gates for common patterns  
✅ **TypeScript** - Full type safety with your existing types  
✅ **Tree-Shakeable** - Import only what you need

## Installation

```bash
npm install @universal-license/react @universal-license/client
# or
yarn add @universal-license/react @universal-license/client
# or
pnpm add @universal-license/react @universal-license/client
```

## Quick Start

### 1. Wrap Your App

```tsx
import { LicenseProvider } from '@universal-license/react';

function App() {
  return (
    <LicenseProvider
      config={{
        baseUrl: process.env.REACT_APP_LICENSE_API_URL!,
        cache: true,
      }}
    >
      <YourApp />
    </LicenseProvider>
  );
}
```

### 2. Use Hooks

```tsx
import { useLicenseValidation } from '@universal-license/react';

function OnboardingPage() {
  const [key, setKey] = useState('');
  const { validation, loading, validate } = useLicenseValidation();

  const handleSubmit = () => validate(key);

  return (
    <div>
      <input value={key} onChange={(e) => setKey(e.target.value)} />
      <button onClick={handleSubmit} disabled={loading}>
        Activate License
      </button>
      {validation?.valid && <p>License is valid!</p>}
    </div>
  );
}
```

### 3. Guard Features

```tsx
import { FeatureGate } from '@universal-license/react';

function Dashboard() {
  return (
    <FeatureGate feature="advancedReporting" fallback={<UpgradePrompt />}>
      <AdvancedReports />
    </FeatureGate>
  );
}
```

## API Reference

### Hooks

#### `useLicense(licenseKey)`

Fetch and manage a single license.

```tsx
const { license, loading, error, refetch } = useLicense('LICENSE-KEY');
```

#### `useLicenseValidation()`

Validate licenses with automatic device fingerprinting.

```tsx
const { validation, loading, error, validate } = useLicenseValidation();
await validate('LICENSE-KEY', { requiredTier: 'pro' });
```

#### `useProducts()`

Fetch products and plans.

```tsx
const { products, loading, getPlans } = useProducts();
const plans = await getPlans('PRODUCT-CODE');
```

#### `usePurchase()`

Handle purchase workflows.

```tsx
const { createOrder, completePurchase, loading } = usePurchase();
const order = await createOrder({ planCode, organizationData });
```

#### `useFeatureFlag(feature, licenseKey?)`

Check if a feature is available.

```tsx
const hasFeature = useFeatureFlag('advancedReporting');
```

### Components

#### `<LicenseProvider>`

Context provider for the SDK client.

**Props:**

- `config: SDKConfig` - SDK configuration

#### `<LicenseGuard>`

Protect routes based on license status.

**Props:**

- `licenseKey: string` - License key to check
- `requiredStatus?: string[]` - Required statuses (default: `['active']`)
- `fallback?: ReactNode` - Content to show if invalid
- `loadingFallback?: ReactNode` - Loading state
- `children: ReactNode` - Protected content

```tsx
<LicenseGuard licenseKey={licenseKey} fallback={<RedirectToRenewal />}>
  <ProtectedContent />
</LicenseGuard>
```

#### `<FeatureGate>`

Show/hide UI based on features.

**Props:**

- `feature: string` - Feature to check
- `licenseKey?: string` - Optional license key (defaults to localStorage)
- `fallback?: ReactNode` - Content to show if feature unavailable
- `children: ReactNode` - Feature content

```tsx
<FeatureGate feature="advancedReporting" fallback={<UpgradeButton />}>
  <AdvancedReportsUI />
</FeatureGate>
```

## Patterns

### Onboarding Flow

```tsx
import { useLicenseValidation, DeviceFingerprint } from '@universal-license/react';

function Onboarding() {
  const [key, setKey] = useState('');
  const { validate, validation, loading } = useLicenseValidation();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const result = await validate(key, {
      requiredTier: 'standard',
      requiredFeatures: ['memberManagement'],
    });

    if (result.valid) {
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter license key" />
      <button type="submit" disabled={loading}>
        {loading ? 'Validating...' : 'Continue'}
      </button>
      {validation && !validation.valid && <p className="error">{validation.error}</p>}
    </form>
  );
}
```

### Feature-Based UI

```tsx
import { FeatureGate } from '@universal-license/react';

function App() {
  return (
    <div>
      {/* Always visible */}
      <BasicDashboard />

      {/* Only for users with 'advancedReporting' feature */}
      <FeatureGate feature="advancedReporting">
        <AdvancedReports />
      </FeatureGate>

      {/* Only for users with 'apiAccess' feature */}
      <FeatureGate
        feature="apiAccess"
        fallback={
          <div>
            <p>API access is available in Pro tier</p>
            <button>Upgrade to Pro</button>
          </div>
        }
      >
        <APIKeysManager />
      </FeatureGate>
    </div>
  );
}
```

### Protected Routes

```tsx
import { LicenseGuard } from '@universal-license/react';
import { useRouter } from 'next/router';

function ProtectedRoute({ children }) {
  const licenseKey = localStorage.getItem('licenseKey');
  const router = useRouter();

  return (
    <LicenseGuard
      licenseKey={licenseKey || ''}
      fallback={
        <div>
          <h2>License Required</h2>
          <p>Please activate your license to continue.</p>
          <button onClick={() => router.push('/activate')}>Activate License</button>
        </div>
      }
    >
      {children}
    </LicenseGuard>
  );
}
```

## Integration Notes

This package is designed to be dropped into typical React apps:

- Use hooks for data fetching and state management.
- Use `LicenseProvider` to share a single client instance.
- Use `LicenseGuard`/`FeatureGate` to conditionally render UI.

## Examples

See [examples/](./examples/) for complete integration examples:

- **basic-setup.tsx** - Minimal onboarding setup
- **dashboard-integration.tsx** - Full dashboard with feature gates

## TypeScript Support

All hooks and components are fully typed:

```tsx
import type { License, ValidateLicenseResponse } from '@universal-license/react';

const { license }: { license: License | null } = useLicense(key);
const { validation }: { validation: ValidateLicenseResponse | null } = useLicenseValidation();
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm test:watch

# Coverage
npm test -- --coverage
```

## License

This project is licensed under the MIT License - see the [LICENSE](../../../LICENSE) file for
details.
