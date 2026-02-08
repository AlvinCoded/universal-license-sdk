# React Examples

Practical examples showing how to integrate the Universal License SDK in React applications.

## Examples Overview

### 1. Basic Setup (`basic-setup.tsx`)

**Purpose:** Minimal configuration for license validation

**Key Features:**

- LicenseProvider setup
- License validation hook
- Simple onboarding form
- Error handling

**Run:**

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install @unilic/react @unilic/client
# Copy basic-setup.tsx content to src/main.tsx
npm run dev
```

### 2. Dashboard Integration (`dashboard-integration.tsx`)

**Purpose:** Full dashboard integration matching your admin portal

**Key Features:**

- License information display
- Feature gating with FeatureGate component
- Protected routes with LicenseGuard
- Pricing page with product selection
- Matches your frontend structure

**Integration:** This example shows a small dashboard-style integration with common patterns:

- A protected dashboard view
- A simple pricing view
- Feature gating for premium UI

## Usage Patterns

### Pattern 1: Onboarding Flow

```tsx
import { useLicenseValidation } from '@unilic/react';

function Onboarding() {
  const { validate, validation, loading } = useLicenseValidation();

  const handleSubmit = async (key: string) => {
    await validate(key);

    if (validation?.valid) {
      // Redirect to app
      router.push('/dashboard');
    }
  };

  return (/* UI */);
}
```

### Pattern 2: Feature Gating

```tsx
import { FeatureGate } from '@unilic/react';

function AdvancedFeature() {
  return (
    <FeatureGate feature="advancedReporting" fallback={<UpgradePrompt />}>
      <AdvancedReportsUI />
    </FeatureGate>
  );
}
```

### Pattern 3: License Info Display

```tsx
import { useLicense } from '@unilic/react';

function LicenseCard() {
  const { license, loading } = useLicense(licenseKey);

  return (
    <div>
      <h3>{license?.org_name}</h3>
      <p>Tier: {license?.tier}</p>
      <p>Expires: {new Date(license?.expires_at).toLocaleDateString()}</p>
    </div>
  );
}
```

## Environment Variables

Create `.env.local` in your project root:

```env
VITE_LICENSE_API_URL=http://localhost:3001/api
```

## Integration with Existing Projects

### Next.js Integration

```tsx
// app/providers.tsx
'use client';

import { LicenseProvider } from '@unilic/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LicenseProvider
      config={{
        baseUrl: process.env.NEXT_PUBLIC_LICENSE_API_URL!,
        cache: true,
      }}
    >
      {children}
    </LicenseProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Vite/CRA Integration

```tsx
// main.tsx or index.tsx
import { LicenseProvider } from '@unilic/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LicenseProvider
      config={{
        baseUrl: import.meta.env.VITE_LICENSE_API_URL,
        cache: true,
      }}
    >
      <App />
    </LicenseProvider>
  </React.StrictMode>
);
```

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test:watch
```

## Learn More

- [Main Documentation](../README.md)
- [API Reference](../../../docs/api-reference.md)
