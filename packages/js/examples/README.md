# SDK Examples

This directory contains comprehensive examples demonstrating how to integrate the Universal License
SDK into various applications and frameworks.

## Examples Overview

### 1. Basic Usage (`basic-usage.ts`)

**Purpose:** Demonstrates core SDK functionality

- Initializing the client
- Testing server connection
- Fetching products and plans
- Validating licenses
- Checking features and expiry

**Run:**

```bash
npx tsx examples/basic-usage.ts
```

### 2. Purchase Flow (`purchase-flow.ts`)

**Purpose:** Complete subscription purchase workflow

- Browsing available plans
- Creating purchase orders
- Processing payments (simulated)
- Completing purchases
- Generating licenses
- Validating new licenses

**Run:**

```bash
npx tsx examples/purchase-flow.ts
```

### 3. React Integration (`react-integration.tsx`)

**Purpose:** Using the SDK in React applications

- Custom hooks for license management
- License onboarding component
- Feature guard component
- License dashboard
- Real-world React patterns

**Integration:**

```tsx
import { LicenseClient } from '@universal-license/client';
import { LicenseOnboarding, FeatureGuard } from './examples/react-integration';

// Use in your React app
function App() {
  return (
    <>
      <LicenseOnboarding />
      <FeatureGuard feature="advancedReporting">
        <AdvancedReports />
      </FeatureGuard>
    </>
  );
}
```

### 4. Next.js Integration (`next-integration.tsx`)

**Purpose:** Next.js App Router integration

- Server-side pricing page
- Client-side purchase flow
- Checkout success handling
- Protected routes
- License middleware

**Pages:**

- `/pricing` - Display subscription plans
- `/checkout/[orderId]` - Payment completion
- `/dashboard` - Protected dashboard

### 5. Admin Operations (`admin-operations.ts`)

**Purpose:** Administrative license management

- Dashboard statistics
- License generation
- License search and filtering
- Upcoming renewals
- License revocation

**Requires:** Admin authentication token

**Run:**

```bash
npx tsx examples/admin-operations.ts
```

### 6. Renewal Flow (`renewal-flow.ts`)

**Purpose:** License renewal workflows

- Checking expiry dates
- Requesting magic links
- Processing renewals
- Payment handling
- Verification

**Run:**

```bash
npx tsx examples/renewal-flow.ts
```

## Configuration

All examples use environment variables for configuration:

```env
# For React/Next.js examples
REACT_APP_LICENSE_API_URL=http://localhost:3001/api
NEXT_PUBLIC_LICENSE_API_URL=http://localhost:3001/api

# For Node.js examples
LICENSE_API_URL=http://localhost:3001/api
```

## Common Patterns

### Initialize Client

```typescript
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: process.env.LICENSE_API_URL || 'http://localhost:3001/api',
  cache: true,
  debug: true, // Enable for development
});
```

### Validate License

```typescript
import { DeviceFingerprint } from '@universal-license/client';

const deviceId = await DeviceFingerprint.generate();
const result = await client.validation.validate({
  licenseKey: 'YOUR-LICENSE-KEY',
  deviceId,
  requiredTier: 'pro',
  requiredFeatures: ['advancedReporting'],
});

if (result.valid) {
  // License is valid - grant access
  console.log('Access granted!');
} else {
  // License invalid - show error
  console.error(result.error);
}
```

### Feature Gating

```typescript
const hasFeature = await client.licenses.hasFeature(licenseKey, 'advancedReporting');

if (hasFeature) {
  // Show advanced reporting UI
} else {
  // Show upgrade prompt
}
```

### Check Tier

```typescript
const hasTier = await client.licenses.hasTier(licenseKey, 'pro');

if (!hasTier) {
  // Redirect to upgrade page
}
```

## Error Handling

All examples demonstrate proper error handling:

```typescript
try {
  const result = await client.validation.validate({
    licenseKey,
    deviceId,
  });
} catch (error: any) {
  if (error.code === 'NETWORK_ERROR') {
    // Handle network issues
  } else if (error.code === 'LICENSE_EXPIRED') {
    // Redirect to renewal
  } else {
    // Generic error handling
  }
}
```

## Testing

Run all examples:

```bash
npm run examples
```

Run specific example:

```bash
npx tsx examples/basic-usage.ts
```

## Integration Checklist

When integrating the SDK into your application:

- [ ] Install SDK: `npm install @universal-license/client`
- [ ] Configure baseUrl in environment variables
- [ ] Initialize LicenseClient
- [ ] Implement license validation on app startup
- [ ] Add feature guards for premium features
- [ ] Handle expiry warnings
- [ ] Implement renewal flow
- [ ] Add error boundaries
- [ ] Test offline scenarios
- [ ] Configure caching strategy

## Support

For issues or questions:

- Check the [main documentation](../README.md)
- Review [API reference](../../docs/api-reference.md)
- Open an issue on GitHub

## License

This project is licensed under the MIT License - see the [LICENSE](../../../LICENSE) file for
details.
