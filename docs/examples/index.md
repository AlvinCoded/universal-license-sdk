# Examples & Patterns

Real-world code examples and patterns for common licensing scenarios.

## Quick Links by Scenario

### Getting Started

- [Basic Validation](/examples/basic-validation) — Validate a license key on app startup
- [Onboarding Flow](/examples/onboarding-flow) — Walk users through license activation

### Integration

- [Dashboard Integration](/examples/dashboard-integration) — Show license info on a dashboard
- [Payment Integration](/examples/payment-integration) — Handle license purchases

### Framework-Specific

- [React Examples](/frameworks/react) — Hooks, components, protected routes
- [Next.js Examples](/frameworks/nextjs) — Server/client setup, API routes
- [Vue Examples](/frameworks/vue) — Composables, protected routes
- [Vanilla JS Examples](/frameworks/vanilla-js) — Direct client usage

## Common Patterns

### Pattern 1: License Validation on App Startup

**When to use:** Every application needs to validate the license when the app loads.

**What happens:**

1. Retrieve stored license key from localStorage/database
2. Generate device fingerprint
3. Call `client.validation.validate()` with both
4. If valid, enable features; if invalid, redirect to onboarding

**Code example:**

```javascript
async function initApp() {
  const licenseKey = localStorage.getItem('licenseKey');
  if (!licenseKey) {
    redirectToOnboarding();
    return;
  }

  const deviceId = localStorage.getItem('deviceId') ?? (await DeviceFingerprint.generate());
  localStorage.setItem('deviceId', deviceId);

  const result = await client.validation.validate({
    licenseKey,
    deviceId,
  });

  if (result.valid) {
    enableFeatures(result.license.features);
    setupUI(result.license);
  } else {
    redirectToOnboarding();
  }
}
```

**See full example:** [Basic Validation](/examples/basic-validation)

---

### Pattern 2: Feature Gating

**When to use:** Show/hide features based on license tier or specific features.

**What happens:**

1. Read the last successful validation you stored (works offline)
2. Check `license.features` or `license.tier`
3. Show/hide UI elements accordingly

**Code example:**

```javascript
// Preferred: try SDK cache convenience helper first
const cached = await client.getCachedLicense(licenseKey); // returns raw license (snake_case) or null
const license = cached
  ? {
      licenseKey: cached.license_key,
      tier: cached.tier,
      features: cached.features, // Record<string, boolean>
    }
  : JSON.parse(localStorage.getItem('uls:lastValidation') ?? 'null')?.license;

if (license?.features?.advancedReporting === true) {
  showReportingSection();
}

if (license?.tier === 'enterprise') {
  showApiAccessSection();
}
```

**See full example:** [Basic Validation](/examples/basic-validation)

---

### Pattern 3: Renewal Management

**When to use:** Prompt users to renew before their license expires.

**What happens:**

1. Check license expiration date
2. If expires within 30 days, show renewal CTA
3. If expired, show renewal required message

**Code example:**

```javascript
const stored = JSON.parse(localStorage.getItem('uls:lastValidation') ?? 'null');
const license = stored?.license;

if (!license?.expiresAt) {
  // No license / no expiry information
  redirectToOnboarding();
}

const daysLeft = (new Date(license.expiresAt) - Date.now()) / (1000 * 60 * 60 * 24);

if (daysLeft <= 30 && daysLeft > 0) {
  showRenewalBanner(`Expires in ${Math.ceil(daysLeft)} days`);
}

if (daysLeft <= 0) {
  showRenewalRequired();
}
```

**See full example:** [Onboarding Flow](/examples/onboarding-flow)

---

### Pattern 4: Purchase Flow

**When to use:** New users purchasing a license, or existing users upgrading.

**What happens:**

1. Load available plans
2. User selects a plan
3. Create purchase order with organization data
4. Redirect to payment
5. After payment, complete purchase and receive license

**Code example:**

```javascript
// Step 1: Show plans
const plans = await client.products.getPlans('PRODUCT_CODE');

// Step 2: Create order
const order = await client.purchases.createOrder({
  planCode: selectedPlan,
  organizationData: {
    orgName: 'Acme Corp',
    ownerName: 'John Doe',
    ownerEmail: 'john@acme.com',
  },
});

// Step 3: Redirect to payment
window.location.href = `/payment?orderId=${order.orderId}`;

// Step 4: Complete purchase (via webhook)
const purchase = await client.purchases.completePurchase({
  orderId: order.orderId,
  paymentReference: 'stripe_id',
});

// License is now: purchase.license.licenseKey
```

**See full example:** [Payment Integration](/examples/payment-integration)

---

### Pattern 5: Offline Validation

**When to use:** Validate licenses when the server is unreachable.

**What happens:**

1. SDK automatically uses cached validation results
2. Optionally verify the cache with RSA signature
3. Allow limited offline usage with cache
4. Re-validate when network is restored

**Code example:**

```javascript
import { verifySignature } from '@universal-license/core';

// Get cached validation
const cachedValid = client.validation.isValidCached(licenseKey);

if (!cachedValid && navigator.onLine) {
  // Offline with no cache
  showOfflineMode();
} else if (cachedValid) {
  // Use cache
  enableFeaturesOffline();

  // Optionally verify signature
  const publicKey = await client.validation.getPublicKey();
  const isVerified = verifySignature(data, signature, publicKey);
}
```

**See full example:** [Offline Validation](/guide/offline-validation)

---

### Pattern 6: Multi-Device Support

**When to use:** Allow users to use a license on multiple devices.

**What happens:**

1. Generate a unique device fingerprint per device
2. Store device fingerprint on that device
3. Each device validates independently
4. License is valid as long as device is registered

**Code example:**

```javascript
const deviceId = localStorage.getItem('deviceId') ?? (await DeviceFingerprint.generate());
localStorage.setItem('deviceId', deviceId);

const result = await client.validation.validate({
  licenseKey: userKey,
  deviceId: deviceId,
});

if (result.valid) {
  // User can use app on this device
  enableApp();
}
```

---

### Pattern 7: Grace Period Handling

**When to use:** Allow limited access after license expiration (e.g., 7-day grace period).

**What happens:**

1. Check if license is expired
2. If expired, check days since expiration
3. If within grace period, allow limited access
4. If past grace period, require renewal

**Code example:**

```javascript
const stored = JSON.parse(localStorage.getItem('uls:lastValidation') ?? 'null');
const license = stored?.license;
const expiryDate = new Date(license.expiresAt);
const now = new Date();
const daysExpired = (now - expiryDate) / (1000 * 60 * 60 * 24);

const GRACE_PERIOD_DAYS = 7;

if (daysExpired > 0 && daysExpired <= GRACE_PERIOD_DAYS) {
  // Grace period
  showGracePeriodBanner();
  enableLimitedFeatures();
} else if (daysExpired > GRACE_PERIOD_DAYS) {
  // Past grace period
  showRenewalRequired();
  redirectToRenew();
}
```

**See full example:** [Renewal & Expiration](/guide/renewal-and-expiration)

---

### Pattern 8: Error Recovery

**When to use:** Handle network errors, timeouts, and validation failures gracefully.

**What happens:**

1. Try to validate on the server
2. If network error, use cache
3. If validation fails, show appropriate error
4. Provide retry mechanism
5. Fall back to offline mode if needed

**Code example:**

```javascript
function loadStoredValidation() {
  try {
    return JSON.parse(localStorage.getItem('uls:lastValidation') ?? 'null');
  } catch {
    return null;
  }
}

async function robustValidate(licenseKey) {
  try {
    const deviceId = localStorage.getItem('deviceId') ?? (await DeviceFingerprint.generate());
    localStorage.setItem('deviceId', deviceId);

    return await client.validation.validate({
      licenseKey,
      deviceId,
    });
  } catch (error) {
    // If the request fails (offline, timeout, etc), fall back to what you stored
    const cached = loadStoredValidation();
    if (cached?.license) {
      console.log('Using stored validation');
      return { valid: true, license: cached.license, cached: true };
    }

    showOfflineError();

    throw error;
  }
}
```

**See full example:** [Error Handling](/guide/error-handling)

---

## Example Structure by Framework

### React Example

- **Source:** [React Framework Guide](/frameworks/react)
- **Patterns:** Hooks, context, components, protected routes
- **Best for:** Modern React SPAs

### Next.js Example

- **Source:** [Next.js Framework Guide](/frameworks/nextjs)
- **Patterns:** Server/client components, API routes, middleware
- **Best for:** Full-stack applications

### Vue Example

- **Source:** [Vue Framework Guide](/frameworks/vue)
- **Patterns:** Composables, components, protected routes
- **Best for:** Vue 3 applications

### Vanilla JS Example

- **Source:** [Vanilla JS Framework Guide](/frameworks/vanilla-js)
- **Patterns:** Direct client usage, DOM manipulation
- **Best for:** Static sites, any JS environment

### Platform-Specific Installation

- **JavaScript/TypeScript:** [JavaScript Installation](/installation/javascript)
- **React:** [React Installation](/installation/react)
- **PHP:** [PHP Installation](/installation/php)
- **Laravel:** [Laravel Installation](/installation/laravel)

---

## Step-by-Step Examples

### 1. Basic Validation (Recommended Start)

→ [View Full Example](/examples/basic-validation)

- ✅ How to validate a license
- ✅ How to store/retrieve license key
- ✅ How to handle success/failure

### 2. Complete Onboarding Flow

→ [View Full Example](/examples/onboarding-flow)

- ✅ License activation form
- ✅ Validation with error handling
- ✅ UI after successful activation

### 3. Dashboard Integration

→ [View Full Example](/examples/dashboard-integration)

- ✅ Display license information
- ✅ Show feature availability
- ✅ Renewal status indicator

### 4. Payment & Purchase

→ [View Full Example](/examples/payment-integration)

- ✅ Plan selection
- ✅ Purchase order creation
- ✅ Payment integration
- ✅ License activation after payment

---

## Testing Examples

### Unit Testing License Validation

```typescript
import { describe, it, expect, vi } from 'vitest';
import { client } from '@/lib/license';

describe('License Validation', () => {
  it('validates a license successfully', async () => {
    const result = await client.validation.validate({
      licenseKey: 'TEST-KEY',
      deviceId: 'test-device',
    });

    expect(result.valid).toBe(true);
  });

  it('returns error for invalid license', async () => {
    const result = await client.validation.validate({
      licenseKey: 'INVALID',
      deviceId: 'test-device',
    });

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Integration Testing with Mock Server

```typescript
// Mock the license server
vi.mock('@universal-license/client', () => ({
  LicenseClient: class MockClient {
    validation = {
      validate: () => {
        return Promise.resolve({
          valid: true,
          license: {
            licenseKey: 'TEST',
            tier: 'pro',
            features: { advancedReporting: true },
            expiresAt: '2025-12-31T23:59:59Z',
          },
        });
      },
    };
  },
}));
```

---

## Best Practices Demonstrated

Each example demonstrates:

1. **Error Handling** — What to do when validation fails
2. **User Experience** — Clear feedback and loading states
3. **Performance** — Using cache efficiently
4. **Security** — Server-side validation where appropriate
5. **Accessibility** — Proper labels, error messages
6. **Offline Support** — Graceful degradation

---

## Troubleshooting Examples

### "License validation always fails"

```javascript
// 1. Check license key format
console.log('License key:', licenseKey);

// 2. Verify device ID is stable
const deviceId = await DeviceFingerprint.generate();
console.log('Device ID:', deviceId);

// 3. Test API connection
const response = await fetch('/.../api/health');
console.log('API response:', response);
```

### "Cache is stale"

```javascript
// Clear your stored validation and re-validate
localStorage.removeItem('uls:lastValidation');

const deviceId = localStorage.getItem('deviceId') ?? (await DeviceFingerprint.generate());
localStorage.setItem('deviceId', deviceId);

await client.validation.validate({
  licenseKey,
  deviceId,
});
```

---

## See Also

- [Framework Integration](/frameworks/) — Pick your framework
- [License Validation Guide](/guide/license-validation) — Full validation guide
- [Feature Gating Guide](/guide/feature-gating) — Advanced feature control
- [API Reference](/api/client) — All available methods
- [Installation](/installation/requirements) — Get started
