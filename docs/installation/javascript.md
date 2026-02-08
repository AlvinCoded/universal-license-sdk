# JavaScript/TypeScript Installation

## Overview

The `@universal-license/client` package works in any JavaScript environment:

- **Node.js** servers (14+)
- **Browser** environments (modern browsers with ES6 support)
- **Electron** desktop apps
- **React Native** (with additional setup)
- **Next.js** (both SSR and CSR)
- **Vite** projects
- **Webpack** projects

## Installation

### Using npm

```bash
npm install @universal-license/client
```

### Using yarn

```bash
yarn add @universal-license/client
```

### Using pnpm

```bash
pnpm add @universal-license/client
```

## Quick Start

### 1. Initialize the Client

```javascript
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: 'https://your-license-server.com/api',
  cache: true, // Enable automatic caching
  timeout: 30000, // 30 second timeout
  retries: 3, // Auto-retry failed requests
  debug: false, // Set to true for detailed logging
});
```

### 2. Validate a License

```javascript
import { DeviceFingerprint } from '@universal-license/client';

const result = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: await DeviceFingerprint.generate(),
  requiredTier: 'standard',
});

if (result.valid) {
  console.log(`✅ License valid for ${result.license.orgName}`);
  console.log(`Tier: ${result.license.tier}`);
} else {
  console.error(`❌ Validation failed: ${result.error}`);
}
```

### 3. Control Feature Access

```javascript
if (result.license.features.advancedReporting) {
  // Enable advanced reporting
} else {
  // Show upgrade prompt
}
```

## Environment Variables

### Browser (Frontend)

Create `.env.local`:

```env
VITE_LICENSE_SERVER_URL=https://your-license-server.com/api
VITE_ENABLE_CACHE=true
VITE_DEBUG_MODE=false
```

Load in your code:

```javascript
const client = new LicenseClient({
  baseUrl: import.meta.env.VITE_LICENSE_SERVER_URL,
  cache: import.meta.env.VITE_ENABLE_CACHE === 'true',
  debug: import.meta.env.VITE_DEBUG_MODE === 'true',
});
```

### Node.js (Server)

Create `.env`:

```env
LICENSE_SERVER_URL=https://your-license-server.com/api
ENABLE_CACHE=true
DEBUG_MODE=false
```

Load with `dotenv`:

```javascript
import 'dotenv/config';

const client = new LicenseClient({
  baseUrl: process.env.LICENSE_SERVER_URL,
  cache: process.env.ENABLE_CACHE === 'true',
  debug: process.env.DEBUG_MODE === 'true',
});
```

## TypeScript Support

Full TypeScript support with complete type definitions:

```typescript
import { LicenseClient, ValidationResult, License } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: 'https://your-license-server.com/api',
});

const result: ValidationResult = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: 'device-fingerprint',
});

if (result.valid) {
  const license: License = result.license;
  const tier: string = license.tier;
  const features: Record<string, boolean> = license.features;
}
```

## Browser Setup

### Vite (Recommended)

No additional setup needed. The SDK works out of the box:

```bash
npm install @universal-license/client
```

### Next.js

Works in both SSR and CSR:

```typescript
// pages/api/validate.ts
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: process.env.LICENSE_SERVER_URL,
});

export default async function handler(req, res) {
  const result = await client.validation.validate(req.body);
  res.json(result);
}
```

### Create React App (CRA)

Works with CRA without ejecting:

```javascript
// src/services/licenseClient.ts
import { LicenseClient } from '@universal-license/client';

export const client = new LicenseClient({
  baseUrl: process.env.REACT_APP_LICENSE_SERVER_URL,
  cache: true,
});
```

### Webpack

Works with standard Webpack config. No special setup needed.

## Node.js Setup

### Basic Node.js App

```javascript
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: 'https://your-license-server.com/api',
});

// Use in your app
export default client;
```

### Express.js Middleware

```javascript
import express from 'express';
import { LicenseClient } from '@universal-license/client';

const app = express();
const client = new LicenseClient({
  baseUrl: process.env.LICENSE_SERVER_URL,
});

app.post('/validate-license', async (req, res) => {
  try {
    const result = await client.validation.validate(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### NestJS Integration

```typescript
import { Injectable } from '@nestjs/common';
import { LicenseClient } from '@universal-license/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LicenseService {
  private client: LicenseClient;

  constructor(private configService: ConfigService) {
    this.client = new LicenseClient({
      baseUrl: configService.get('LICENSE_SERVER_URL'),
    });
  }

  async validate(licenseKey: string, deviceId: string) {
    return this.client.validation.validate({ licenseKey, deviceId });
  }
}
```

## Troubleshooting

### "Module not found" Error

Ensure the package is installed:

```bash
npm list @universal-license/client
```

If not listed, reinstall:

```bash
npm install @universal-license/client
```

### CORS Errors

If you get CORS errors, configure your license server:

**Server (.env):**

```env
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
```

### TypeScript Errors

Ensure TypeScript version 4.5+:

```bash
npm list typescript
npm install --save-dev typescript@latest
```

Check tsconfig.json has ES2020+ target:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext"
  }
}
```

### Import Issues

If you have import issues with CommonJS:

```javascript
// CommonJS (Node.js)
const { LicenseClient } = require('@universal-license/client');

// Or use async import
const { LicenseClient } = await import('@universal-license/client');
```

## Package Contents

After installation, you have access to:

```javascript
// Main client
import { LicenseClient } from '@universal-license/client';

// Modules
import { ValidationModule } from '@universal-license/client';
import { LicenseModule } from '@universal-license/client';
import { ProductModule } from '@universal-license/client';
import { PurchaseModule } from '@universal-license/client';

// Utilities
import { DeviceFingerprint } from '@universal-license/client';
import {
    isValidEmail,
    isValidLicenseKey,
    isValidProductCode,
    isValidPlanCode,
    isValidTier,
    isLicenseExpired,
    daysUntilExpiry,
    verifySignature,
} from '@universal-license/client';

// Types (TypeScript)
import type {
    License,
    ValidateLicenseResponse,
    Product,
    SubscriptionPlan
} from '@universal-license/client';

// Exceptions
import {
    ValidationError,
    NetworkError
} from '@universal-license/client';
```

## Verification

Test your installation:

```javascript
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: 'https://your-license-server.com/api',
});

// Test connection
try {
  const result = await client.validate({
    licenseKey: 'test-key',
    deviceId: 'test-device',
  });
  console.log('✅ SDK is working!');
} catch (error) {
  console.error('❌ SDK error:', error.message);
}
```

## Next Steps

- [Getting Started](/getting-started) - Start using the SDK
- [API Reference](/api/) - Explore all available methods
- [Examples](/examples/basic-validation) - See real-world examples
- [Types](/api/types) - TypeScript type reference
