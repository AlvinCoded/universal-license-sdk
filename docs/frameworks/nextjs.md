# Next.js Integration

Complete guide to integrating the Universal License SDK with Next.js applications (both App Router
and Pages Router).

## Prerequisites

- Next.js 12+
- `@universal-license/client` installed
- Knowledge of Next.js fundamentals

## Installation

```bash
npm install @universal-license/client
# or
pnpm add @universal-license/client
```

## Setup (App Router - Recommended)

### 1. Environment Variables

```env
# .env.local
NEXT_PUBLIC_LICENSE_SERVER_URL=https://license.yourdomain.com/api
LICENSE_SERVER_SECRET_KEY=your-secret-key (for server-side validation)
```

### 2. Create License Provider

```typescript
// src/providers/LicenseProvider.tsx
'use client';

import { ReactNode, createContext, useContext } from 'react';
import { LicenseClient } from '@universal-license/client';

const LicenseContext = createContext<LicenseClient | null>(null);

export function LicenseProvider({ children }: { children: ReactNode }) {
  const client = new LicenseClient({
    baseUrl: process.env.NEXT_PUBLIC_LICENSE_SERVER_URL!,
    cache: true,
    debug: process.env.NODE_ENV === 'development'
  });

  return (
    <LicenseContext.Provider value={client}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicenseClient() {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicenseClient must be used within LicenseProvider');
  }
  return context;
}
```

### 3. Wrap App with Provider

```typescript
// src/app/layout.tsx
import { LicenseProvider } from '@/providers/LicenseProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Licensed App'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LicenseProvider>
          {children}
        </LicenseProvider>
      </body>
    </html>
  );
}
```

## Core Patterns

### 1. Server-Side Validation (Secure)

```typescript
// src/lib/license.ts
import { LicenseClient } from '@universal-license/client';

export const serverClient = new LicenseClient({
  baseUrl: process.env.NEXT_PUBLIC_LICENSE_SERVER_URL!,
  apiKey: process.env.LICENSE_SERVER_SECRET_KEY, // For admin operations
});

export async function validateLicenseServer(licenseKey: string, deviceId: string) {
  try {
    const result = await serverClient.validate({
      licenseKey,
      deviceId,
    });
    return result;
  } catch (error) {
    console.error('Server validation failed:', error);
    throw error;
  }
}
```

### 2. API Route for License Validation

```typescript
// src/app/api/validate/route.ts
import { validateLicenseServer } from '@/lib/license';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { licenseKey, deviceId } = await request.json();

    if (!licenseKey || !deviceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await validateLicenseServer(licenseKey, deviceId);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
```

### 3. Client-Side Validation Hook

```typescript
// src/hooks/useLicense.ts
'use client';

import { useEffect, useState } from 'react';
import { DeviceFingerprint } from '@universal-license/client';
import type { ValidationResult } from '@universal-license/client';

export function useLicenseValidation(licenseKey: string) {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function validate() {
      try {
        setIsLoading(true);
        setError(null);

        const deviceId = await DeviceFingerprint.generate();

        // Use server endpoint for better security
        const response = await fetch('/api/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ licenseKey, deviceId }),
        });

        if (!response.ok) throw new Error('Validation failed');

        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }

    validate();
  }, [licenseKey]);

  return { result, isLoading, error };
}
```

### 4. Protected Page Component

```typescript
// src/app/dashboard/page.tsx
'use client';

import { useLicenseValidation } from '@/hooks/useLicense';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const licenseKey = localStorage.getItem('licenseKey');
  const { result, isLoading, error } = useLicenseValidation(licenseKey || '');

  useEffect(() => {
    if (!isLoading && (!result?.valid || error)) {
      router.push('/onboarding');
    }
  }, [result, isLoading, error, router]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome, {result?.license?.ownerName}</p>
      <p>Plan: {result?.license?.tier}</p>
    </main>
  );
}
```

### 5. API Route with Authentication Middleware

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/api/protected'];

export function middleware(request: NextRequest) {
  const licenseKey = request.cookies.get('licenseKey')?.value;

  for (const route of protectedRoutes) {
    if (request.nextUrl.pathname.startsWith(route)) {
      if (!licenseKey) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
```

### 6. Onboarding Flow

```typescript
// src/app/onboarding/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLicenseClient } from '@/providers/LicenseProvider';
import { DeviceFingerprint } from '@universal-license/client';

export default function Onboarding() {
  const router = useRouter();
  const client = useLicenseClient();
  const [licenseKey, setLicenseKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleActivate() {
    setIsValidating(true);
    setError(null);

    try {
      const result = await client.validate({
        licenseKey,
        deviceId: await DeviceFingerprint.generate()
      });

      if (result.valid) {
        localStorage.setItem('licenseKey', licenseKey);
        router.push('/dashboard');
      } else {
        setError(result.error || 'Invalid license key');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <div className="onboarding-container">
      <h1>Activate Your License</h1>
      <input
        type="text"
        placeholder="Enter license key"
        value={licenseKey}
        onChange={(e) => setLicenseKey(e.target.value)}
        disabled={isValidating}
      />
      <button onClick={handleActivate} disabled={isValidating}>
        {isValidating ? 'Validating...' : 'Activate'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

### 7. Purchase Flow

```typescript
// src/app/purchase/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useLicenseClient } from '@/providers/LicenseProvider';

export default function Purchase() {
  const client = useLicenseClient();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [formData, setFormData] = useState({
    orgName: '',
    ownerName: '',
    ownerEmail: ''
  });

  useEffect(() => {
    async function loadPlans() {
      const data = await client.plans.getByProduct('YOUR_PRODUCT_CODE');
      setPlans(data);
    }
    loadPlans();
  }, [client]);

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    setIsCreatingOrder(true);

    try {
      const order = await client.purchases.createOrder({
        planCode: selectedPlan!,
        organizationData: formData
      });

      // Redirect to payment gateway
      window.location.href = `/payment?orderId=${order.orderId}`;
    } catch (error) {
      alert('Order creation failed: ' + (error as Error).message);
    } finally {
      setIsCreatingOrder(false);
    }
  }

  return (
    <div className="purchase-container">
      <h1>Choose Your Plan</h1>

      <div className="plans-grid">
        {plans.map((plan: any) => (
          <div
            key={plan.code}
            className={`plan-card ${selectedPlan === plan.code ? 'selected' : ''}`}
            onClick={() => setSelectedPlan(plan.code)}
          >
            <h3>{plan.name}</h3>
            <p className="price">${plan.price}</p>
            <button type="button">Select</button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <form onSubmit={handleCreateOrder}>
          <h2>Organization Details</h2>
          <input
            type="text"
            placeholder="Organization Name"
            required
            value={formData.orgName}
            onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Your Name"
            required
            value={formData.ownerName}
            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email Address"
            required
            value={formData.ownerEmail}
            onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
          />
          <button type="submit" disabled={isCreatingOrder}>
            {isCreatingOrder ? 'Creating Order...' : 'Continue to Payment'}
          </button>
        </form>
      )}
    </div>
  );
}
```

### 8. Pages Router (Legacy)

If using Pages Router instead of App Router:

```typescript
// pages/api/validate.ts
import { validateLicenseServer } from '@/lib/license';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { licenseKey, deviceId } = req.body;

  try {
    const result = await validateLicenseServer(licenseKey, deviceId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
}
```

```typescript
// pages/dashboard.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useLicenseValidation } from '@/hooks/useLicense';

export default function Dashboard() {
  const router = useRouter();
  const [licenseKey, setLicenseKey] = useState<string>('');
  const { result, isLoading } = useLicenseValidation(licenseKey);

  useEffect(() => {
    const stored = localStorage.getItem('licenseKey');
    if (stored) setLicenseKey(stored);
  }, []);

  useEffect(() => {
    if (!isLoading && !result?.valid) {
      router.push('/onboarding');
    }
  }, [result, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;

  return <div>Welcome to Dashboard</div>;
}
```

## Static Generation with License Check

```typescript
// src/app/pricing/page.tsx
import { serverClient } from '@/lib/license';

export const revalidate = 3600; // Revalidate every hour

export default async function PricingPage() {
  const products = await serverClient.products.getAll();

  return (
    <main>
      <h1>Pricing</h1>
      {products.map((product: any) => (
        <div key={product.code}>{product.name}</div>
      ))}
    </main>
  );
}
```

## Environment Setup

```env
# .env.local (development)
NEXT_PUBLIC_LICENSE_SERVER_URL=http://localhost:3000/api/license
LICENSE_SERVER_SECRET_KEY=dev-secret-key

# .env.production
NEXT_PUBLIC_LICENSE_SERVER_URL=https://api.yourdomain.com/license
LICENSE_SERVER_SECRET_KEY=your-production-secret-key
```

## Error Handling

```typescript
// src/lib/errors.ts
export class LicenseError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export const LICENSE_ERRORS = {
  INVALID: 'License key is invalid',
  EXPIRED: 'License has expired',
  DEVICE_MISMATCH: 'License not valid for this device',
  NETWORK_ERROR: 'Unable to validate license (network error)',
  TIMEOUT: 'Validation request timed out',
};
```

## Performance Optimization

```typescript
// Reuse client instance
// src/lib/licenseClient.ts
import { LicenseClient } from '@universal-license/client';

let client: LicenseClient | null = null;

export function getLicenseClient() {
  if (!client) {
    client = new LicenseClient({
      baseUrl: process.env.NEXT_PUBLIC_LICENSE_SERVER_URL!,
    });
  }
  return client;
}
```

## Testing

```typescript
// src/__tests__/api/validate.test.ts
import { validateLicenseServer } from '@/lib/license';

describe('/api/validate', () => {
  it('validates license successfully', async () => {
    const result = await validateLicenseServer('TEST-LICENSE-KEY', 'test-device');
    expect(result.valid).toBe(true);
  });
});
```

## Deployment Checklist

- [ ] Set `LICENSE_SERVER_SECRET_KEY` in production environment
- [ ] Use HTTPS for all API calls
- [ ] Implement rate limiting on `/api/validate`
- [ ] Add logging for license validation failures
- [ ] Test offline scenarios
- [ ] Verify license checks on protected routes
- [ ] Test payment/renewal flows
- [ ] Set up monitoring for API errors

## Troubleshooting

### "License validation always fails"

→ Check `NEXT_PUBLIC_LICENSE_SERVER_URL` is correct → Verify license key format → Check browser
console for errors

### "Page redirects to onboarding unexpectedly"

→ Verify localStorage is working → Check `useLicenseValidation` hook → Look for timing issues with
useEffect

### "Cannot use client-side hook on server component"

→ Add `'use client'` directive at top of file → Move data fetching to server components or API
routes

## See Also

- [React Integration](/frameworks/react)
- [License Validation](/guide/license-validation)
- [API Reference](/api/client)
- [Installation](/installation/javascript)
- [Examples](/examples/)
