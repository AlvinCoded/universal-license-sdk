# React Installation

## Overview

`@universal-license/react` provides React-specific hooks and components for integrating the
Universal License SDK:

- **LicenseProvider** - Provides a `LicenseClient` instance via React context
- **useLicense** - Access license-related client state
- **useLicenseValidation** - Validate licenses with automatic device fingerprinting
- **useFeatureFlag** - Check feature access
- **FeatureGate** - Conditional rendering based on features
- **LicenseGuard** - Protect routes/components

Supports:

- React `^18 || ^19`
- Vite + React
- Next.js (App Router or Pages Router)
- Create React App (CRA)

## Installation

```bash
pnpm add @universal-license/react @universal-license/client
```

## Setup

### 1. Configure Environment

Vite:

```env
VITE_LICENSE_SERVER_URL=https://your-license-server.com/api
```

Next.js:

```env
NEXT_PUBLIC_LICENSE_SERVER_URL=https://your-license-server.com/api
```

CRA:

```env
REACT_APP_LICENSE_SERVER_URL=https://your-license-server.com/api
```

### 2. Wrap Your App with `LicenseProvider`

#### Vite + React

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { LicenseProvider } from '@universal-license/react';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LicenseProvider
      config={{
        baseUrl: import.meta.env.VITE_LICENSE_SERVER_URL,
        cache: true,
      }}
    >
      <App />
    </LicenseProvider>
  </React.StrictMode>
);
```

#### Next.js (App Router)

```tsx
// app/layout.tsx
import React from 'react';
import { LicenseProvider } from '@universal-license/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LicenseProvider
          config={{
            baseUrl: process.env.NEXT_PUBLIC_LICENSE_SERVER_URL!,
            cache: true,
          }}
        >
          {children}
        </LicenseProvider>
      </body>
    </html>
  );
}
```

#### Create React App (CRA)

```tsx
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { LicenseProvider } from '@universal-license/react';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <LicenseProvider
      config={{
        baseUrl: process.env.REACT_APP_LICENSE_SERVER_URL!,
        cache: true,
      }}
    >
      <App />
    </LicenseProvider>
  </React.StrictMode>
);
```

### 3. Validate a License in a Component

```tsx
import React from 'react';
import { useLicenseValidation } from '@universal-license/react';

export function Onboarding() {
  const [licenseKey, setLicenseKey] = React.useState('');
  const { validation, loading, error, validate } = useLicenseValidation();

  return (
    <div>
      <input value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} />
      <button disabled={loading} onClick={() => void validate(licenseKey)}>
        Validate
      </button>

      {loading && <p>Validating...</p>}
      {error && <p>Error: {error}</p>}
      {validation?.valid === false && <p>License invalid</p>}
      {validation?.valid && <p>License valid</p>}
    </div>
  );
}
```

{ ssr: false } ) ) }

```

## Next Steps

- [React Guide](/frameworks/react) - Provider, hooks, and components
- [License Validation](/guide/license-validation) - Validation patterns and options
- [Feature Gating](/guide/feature-gating) - Tier/feature-based UX
- [Examples](/examples/) - End-to-end patterns
- [Troubleshooting](/troubleshooting) - Common pitfalls and diagnostics
```
