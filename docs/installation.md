---
# filepath: universal-license-sdk/docs/installation.md
---

# Installation

Complete installation instructions for all SDK packages across different environments.

## Prerequisites

Before installing the Universal License SDK, ensure you have:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0, **pnpm** >= 8.0.0, or **yarn** >= 1.22.0
- **TypeScript** >= 5.0.0 (for TypeScript projects)

## Package Overview

The Universal License SDK consists of three packages:

| Package                     | Purpose                    | Size  |
| --------------------------- | -------------------------- | ----- |
| `@universal-license/core`   | Shared types and utilities | ~10KB |
| `@universal-license/client` | JavaScript/TypeScript SDK  | ~50KB |
| `@universal-license/react`  | React hooks and components | ~30KB |

## JavaScript/TypeScript Projects

### Using npm

```bash
# Core + Client (most common)
npm install @universal-license/client

# Client includes core as dependency, so you get both
```

### Using pnpm (Recommended)

```bash
pnpm add @universal-license/client
```

### Using yarn

```bash
yarn add @universal-license/client
```

## React Projects

### Using npm

```bash
# Install both client and React package
npm install @universal-license/react @universal-license/client
```

### Using pnpm

```bash
pnpm add @universal-license/react @universal-license/client
```

### Using yarn

```bash
yarn add @universal-license/react @universal-license/client
```

## Framework-Specific Installation

### Next.js (App Router)

```bash
# Install dependencies
pnpm add @universal-license/react @universal-license/client

# Next.js 13+ with App Router is fully supported
```

**Setup:**

```tsx
// app/providers.tsx
'use client';

import { LicenseProvider } from '@universal-license/react';

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

### Next.js (Pages Router)

```bash
pnpm add @universal-license/react @universal-license/client
```

**Setup:**

```tsx
// pages/_app.tsx
import { LicenseProvider } from '@universal-license/react';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LicenseProvider
      config={{
        baseUrl: process.env.NEXT_PUBLIC_LICENSE_API_URL!,
        cache: true,
      }}
    >
      <Component {...pageProps} />
    </LicenseProvider>
  );
}
```

### Vite + React

```bash
pnpm add @universal-license/react @universal-license/client
```

**Setup:**

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
        baseUrl: import.meta.env.VITE_LICENSE_API_URL,
        cache: true,
      }}
    >
      <App />
    </LicenseProvider>
  </React.StrictMode>
);
```

### Create React App

```bash
npm install @universal-license/react @universal-license/client
```

**Setup:**

```tsx
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { LicenseProvider } from '@universal-license/react';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <LicenseProvider
      config={{
        baseUrl: process.env.REACT_APP_LICENSE_API_URL!,
        cache: true,
      }}
    >
      <App />
    </LicenseProvider>
  </React.StrictMode>
);
```

### Vue 3

```bash
pnpm add @universal-license/client
```

**Setup:**

```typescript
// src/plugins/license.ts
import { LicenseClient } from '@universal-license/client';

export const licenseClient = new LicenseClient({
  baseUrl: import.meta.env.VITE_LICENSE_API_URL,
  cache: true,
});

// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { licenseClient } from './plugins/license';

const app = createApp(App);

app.config.globalProperties.$license = licenseClient;

app.mount('#app');
```

### Angular

```bash
npm install @universal-license/client
```

**Setup:**

```typescript
// src/app/services/license.service.ts
import { Injectable } from '@angular/core';
import { LicenseClient } from '@universal-license/client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LicenseService {
  private client: LicenseClient;

  constructor() {
    this.client = new LicenseClient({
      baseUrl: environment.licenseApiUrl,
      cache: true,
    });
  }

  async validate(licenseKey: string, deviceId: string) {
    return this.client.validation.validate({ licenseKey, deviceId });
  }
}
```

### Vanilla JavaScript (Browser)

For browser-based projects without a bundler:

```html
<!-- Using CDN (unpkg) -->
<script type="module">
  import {
    LicenseClient,
    DeviceFingerprint,
  } from 'https://unpkg.com/@universal-license/client@latest/dist/index.mjs';

  const client = new LicenseClient({
    baseUrl: 'https://your-license-server.com/api',
  });

  // Use the client
  async function validateLicense(key) {
    const deviceId = await DeviceFingerprint.generate();
    const result = await client.validation.validate({
      licenseKey: key,
      deviceId,
    });

    console.log('Valid:', result.valid);
  }
</script>
```

### Node.js Server

```bash
pnpm add @universal-license/client
```

**Setup:**

```typescript
// src/services/licenseService.ts
import { LicenseClient } from '@universal-license/client';

export const licenseClient = new LicenseClient({
  baseUrl: process.env.LICENSE_API_URL!,
  cache: true,
  timeout: 30000,
});

// Use in your server
export async function validateUserLicense(licenseKey: string, deviceId: string) {
  return licenseClient.validation.validate({
    licenseKey,
    deviceId,
    requiredTier: 'standard',
  });
}
```

## Environment Variables

After installation, configure your environment variables:

### Next.js

```bash
# .env.local
NEXT_PUBLIC_LICENSE_API_URL=https://your-license-server.com/api
```

### Vite

```bash
# .env
VITE_LICENSE_API_URL=https://your-license-server.com/api
```

### Create React App

```bash
# .env
REACT_APP_LICENSE_API_URL=https://your-license-server.com/api
```

### Node.js

```bash
# .env
LICENSE_API_URL=https://your-license-server.com/api
```

## Verify Installation

After installation, verify everything is working:

```typescript
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: process.env.YOUR_ENV_VAR,
});

// Test connection
client.testConnection().then((health) => {
  if (health.healthy) {
    console.log('✓ SDK connected successfully!');
  } else {
    console.error('✗ Connection failed');
  }
});
```

## TypeScript Configuration

If using TypeScript, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

## Troubleshooting

### Module not found

If you see `Cannot find module '@universal-license/client'`:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Type errors

If you see TypeScript errors:

```bash
# Install types
npm install -D @types/node

# Restart TypeScript server in VS Code
# Press Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### CORS errors

If you get CORS errors, ensure your license server allows your origin:

```typescript
// In your server (server.ts)
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://your-app.com'],
    credentials: true,
  })
);
```

### Network errors

If validation requests fail:

1. Check `baseUrl` is correct
2. Verify license server is running
3. Test with `curl`:

```bash
curl http://localhost:3001/api/health
```

## Next Steps

- [Getting Started](/getting-started) - Quick start tutorial
- [License Validation Guide](/guide/license-validation) - Validation patterns and reason codes
- [API Client](/api/client) - Client + module reference
- [Examples](/examples/) - Working code examples

## Support

If installation is failing, start with:

- [Troubleshooting](/troubleshooting)
- [Environment Variables](/config/environment)
- [SDK Configuration](/config/sdk-config)
