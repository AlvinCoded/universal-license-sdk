# React Integration

Complete guide to integrating the Universal License SDK with React applications.

## Prerequisites

- React 18+
- @universal-license/react package installed
- Basic React knowledge

## Installation

```bash
pnpm add @universal-license/react @universal-license/client
```

## LicenseProvider Setup

Wrap your app with `LicenseProvider` to make license functionality available throughout:

```tsx
// src/App.tsx
import { LicenseProvider } from '@universal-license/react';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <LicenseProvider
      config={{
        baseUrl: process.env.REACT_APP_LICENSE_API_URL!,
        cache: true,
        timeout: 30000,
      }}
    >
      <Dashboard />
    </LicenseProvider>
  );
}

export default App;
```

## Using Hooks

### useLicenseValidation

Validate a license key:

```tsx
import { useLicenseValidation } from '@universal-license/react';

function OnboardingForm() {
  const [licenseKey, setLicenseKey] = useState('');
  const { validate, validation, loading, error } = useLicenseValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await validate(licenseKey, {
      requiredTier: 'standard',
      requiredFeatures: ['basicFeature'],
    });

    if (result.valid) {
      // Store and redirect
      localStorage.setItem('licenseKey', licenseKey);
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={licenseKey}
        onChange={(e) => setLicenseKey(e.target.value)}
        placeholder="Enter license key"
        required
      />
      <button disabled={loading}>{loading ? 'Validating...' : 'Activate'}</button>
      {error && <p className="error">{error}</p>}
      {validation && !validation.valid && <p className="error">{validation.error}</p>}
    </form>
  );
}
```

### useLicense

Fetch license information:

```tsx
import { useLicense } from '@universal-license/react';

function LicenseInfo() {
  const licenseKey = localStorage.getItem('licenseKey');
  const { license, loading, error, refetch } = useLicense(licenseKey);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>License Information</h2>
      <p>Organization: {license?.org_name}</p>
      <p>Status: {license?.status}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### useFeatureFlag

Simple feature access checking (boolean):

```tsx
import { useFeatureFlag } from '@universal-license/react';

function AdvancedFeatures() {
  const hasFeature = useFeatureFlag('advancedReporting');

  if (!hasFeature) {
    return <p>Upgrade to access Advanced Reporting.</p>;
  }

  return <div>Advanced Reporting</div>;
}
```

## Components

### `<LicenseGuard>`

Protect routes that require valid licenses:

```tsx
import { LicenseGuard } from '@universal-license/react';
import Dashboard from './Dashboard';

function ProtectedLayout() {
  const licenseKey = localStorage.getItem('licenseKey') ?? '';

  return (
    <LicenseGuard
      licenseKey={licenseKey}
      fallback={<Redirect to="/onboarding" />}
      loadingFallback={<div>Loading...</div>}
    >
      <Dashboard />
    </LicenseGuard>
  );
}
```

### `<FeatureGate>`

Conditionally render features:

```tsx
import { FeatureGate } from '@universal-license/react';

function Settings() {
  return (
    <div>
      <FeatureGate feature="apiAccess">
        <section>
          <h3>API Configuration</h3>
          {/* API settings */}
        </section>
      </FeatureGate>

      <FeatureGate feature="webhooks" fallback={<p>Upgrade to Pro to enable webhooks</p>}>
        <section>
          <h3>Webhooks</h3>
          {/* Webhook settings */}
        </section>
      </FeatureGate>
    </div>
  );
}
```

## Complete Example: Onboarding Flow

```tsx
// src/pages/Onboarding.tsx
import { useState } from 'react';
import { useLicenseValidation } from '@universal-license/react';

export default function OnboardingPage() {
  const { validate, validation, loading, error } = useLicenseValidation();
  const [licenseKey, setLicenseKey] = useState('');
  const [step, setStep] = useState<'input' | 'success' | 'error'>('input');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await validate(licenseKey, {
      requiredTier: 'standard',
    });

    if (result.valid) {
      setStep('success');

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } else {
      setStep('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {step === 'input' && (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6">Activate Your License</h1>

          <div className="space-y-4">
            <div>
              <label htmlFor="license" className="block text-sm font-medium mb-2">
                License Key
              </label>
              <input
                id="license"
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="e.g., PROD-ORG-2025-A1B2-C3D4-E5F6"
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Activate License'}
            </button>

            {error && (
              <div className="p-4 bg-red-100 border border-red-400 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {validation && !validation.valid && (
              <div className="p-4 bg-red-100 border border-red-400 rounded-lg text-red-700">
                {validation.error}
              </div>
            )}
          </div>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600">✅ License Activated!</h2>
          <p className="text-gray-600 mt-4">Redirecting to dashboard...</p>
        </div>
      )}

      {step === 'error' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">❌ Validation Failed</h2>
          <button
            onClick={() => {
              setStep('input');
              setLicenseKey('');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
```

## Best Practices

### 1. Store License in Context

```tsx
import { createContext, useContext, ReactNode } from 'react';

interface LicenseContextType {
  license: License | null;
  tier: string | null;
}

const LicenseContext = createContext<LicenseContextType>({
  license: null,
  tier: null,
});

export function LicenseContextProvider({ children }: { children: ReactNode }) {
  const { license, tier } = useLicense();

  return <LicenseContext.Provider value={{ license, tier }}>{children}</LicenseContext.Provider>;
}

export const useLicenseContext = () => useContext(LicenseContext);
```

### 2. Periodic Revalidation

```tsx
import { useEffect } from 'react';
import { useLicense } from '@universal-license/react';

function usePeriodicLicenseCheck(interval = 24 * 60 * 60 * 1000) {
  const { revalidate } = useLicense();

  useEffect(() => {
    const timer = setInterval(async () => {
      const valid = await revalidate();
      if (!valid) {
        // License expired or revoked
        window.location.href = '/renew';
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);
}

// Usage
export default function App() {
  usePeriodicLicenseCheck();
  return <Dashboard />;
}
```

### 3. Error Boundary

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback() {
  return (
    <div>
      <h1>License validation error</h1>
      <button onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <LicenseProvider config={...}>
        <Dashboard />
      </LicenseProvider>
    </ErrorBoundary>
  );
}
```

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { LicenseProvider } from '@universal-license/react';

describe('License Integration', () => {
  it('validates license successfully', async () => {
    const mockConfig = {
      baseUrl: 'http://localhost:3001/api',
    };

    render(
      <LicenseProvider config={mockConfig}>
        <OnboardingForm />
      </LicenseProvider>
    );

    // Test license validation
    const input = screen.getByPlaceholderText(/license key/i);
    fireEvent.change(input, { target: { value: 'TEST-KEY' } });
    fireEvent.click(screen.getByText(/validate/i));

    // Assert validation result
    await screen.findByText(/license activated/i);
  });
});
```

## See Also

- [Getting Started](/getting-started)
- [API Reference](/api/client)
- [Next.js Integration](/frameworks/nextjs)
- [Feature Gating](/guide/feature-gating)
