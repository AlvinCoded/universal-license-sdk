# Vanilla JavaScript Integration

Use the Universal License SDK directly in any JavaScript environment without framework abstractions.

## When to Use Vanilla JavaScript

✅ **Good fit for:**

- Static websites
- Server-side applications (Node.js, Deno)
- Progressive enhancement
- Lightweight applications
- Custom frameworks
- Command-line tools

## Basic Setup

```javascript
import { LicenseClient, DeviceFingerprint } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: process.env.LICENSE_SERVER_URL,
  cache: true,
  debug: false,
});

// On application startup
async function initializeLicense() {
  try {
    const result = await client.validate({
      licenseKey: getUserLicenseKey(),
      deviceId: await DeviceFingerprint.generate(),
    });

    if (result.valid) {
      enableFeatures(result.license.features);
      return result.license;
    } else {
      showError(`License invalid: ${result.error}`);
      redirectToOnboarding();
    }
  } catch (error) {
    console.error('Validation failed:', error);
    // Use cached validation if available
    const cached = client.validation.isValidCached(licenseKey);
    if (cached) {
      enableCachedFeatures();
    } else {
      showOfflineMode();
    }
  }
}

// Call on app startup
initializeLicense();
```

## Core Patterns

### 1. License Validation

```javascript
// Quick validation with device binding
const result = await client.validate({
  licenseKey: 'USER-LICENSE-KEY',
  deviceId: 'device-fingerprint',
  requiredTier: 'pro',
  requiredFeatures: ['advancedReporting'],
});

if (result.valid) {
  console.log(`✅ Licensed for ${result.license.tier}`);
  // License object contains:
  // - licenseKey
  // - tier (free, standard, pro, enterprise)
  // - features (object with boolean flags)
  // - expiresAt (ISO timestamp)
  // - orgName, ownerName, ownerEmail
} else {
  console.error(`❌ ${result.error}`);
}
```

### 2. Feature Gating

```javascript
function setupUI() {
  const license = client.licenses.getCached();

  if (!license) return;

  // Show/hide UI based on license features
  if (license.features.advancedReporting) {
    document.getElementById('reports-section').style.display = 'block';
  } else {
    document.getElementById('upgrade-prompt').style.display = 'block';
  }

  // Show/hide based on tier
  if (license.tier === 'enterprise') {
    document.getElementById('api-docs-link').style.display = 'block';
  }

  // Show/hide based on expiration
  const expiresIn = new Date(license.expiresAt) - Date.now();
  if (expiresIn < 30 * 24 * 60 * 60 * 1000) {
    // 30 days
    document.getElementById('renewal-banner').style.display = 'block';
  }
}
```

### 3. Offline Validation (with Signature Verification)

```javascript
import { verifySignature } from '@universal-license/core';

async function validateOfflineWithSignature(licenseKey, deviceId, signature) {
  try {
    // Get the public key for signature verification
    const publicKey = await client.validation.getPublicKey();

    // Verify the signature
    const dataToVerify = JSON.stringify({
      licenseKey,
      deviceId,
      timestamp: Math.floor(Date.now() / 1000),
    });

    const isValid = verifySignature(
      dataToVerify,
      signature, // base64-encoded signature
      publicKey
    );

    if (isValid) {
      console.log('✅ License signature verified');
      return true;
    } else {
      console.error('❌ License signature invalid');
      return false;
    }
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}
```

### 4. Getting License Information

```javascript
// Get specific license (if you have multiple)
const license = await client.licenses.get('PROD-ORG-2025-XXXX-XXXX-XXXX');

// Check cache first
const cached = client.licenses.getCached();

// Get all available products
const products = await client.products.getAll();

// Get plans for a product
const plans = await client.plans.getByProduct('PROD');

// Handle renewal
if (isExpired(license)) {
  const renewal = await client.renewals.createRenewal({
    licenseKey: license.licenseKey,
    months: 12,
  });
  console.log(`Renewal available: ${renewal.renewalCode}`);
}
```

### 5. Purchase Flow

```javascript
async function startPurchaseFlow() {
  try {
    // Step 1: Get available plans
    const plans = await client.plans.getByProduct('PROD');
    console.log('Available plans:', plans);

    // Step 2: Create a purchase order
    const order = await client.purchases.createOrder({
      planCode: 'PROD-PRO-ANNUAL',
      organizationData: {
        orgName: 'My Organization',
        ownerName: 'John Doe',
        ownerEmail: 'john@example.com',
      },
    });

    console.log(`Order created: ${order.orderId}`);

    // Step 3: Redirect to payment (implementation-specific)
    redirectToPaymentGateway(order.orderId);

    // Step 4: Complete purchase after payment
    // (Usually handled via webhook or callback)
    const purchase = await client.purchases.completePurchase({
      orderId: order.orderId,
      paymentReference: 'stripe_payment_id',
    });

    console.log(`License activated: ${purchase.license.licenseKey}`);

    // Store the new license key
    storeLicenseKey(purchase.license.licenseKey);
  } catch (error) {
    console.error('Purchase failed:', error);
  }
}
```

### 6. Error Handling

```javascript
async function validateWithErrorHandling() {
  try {
    return await client.validate({
      licenseKey: getStoredKey(),
      deviceId: await DeviceFingerprint.generate(),
    });
  } catch (error) {
    if (error.code === 'NETWORK_ERROR') {
      console.log('Network offline - using cache');
      return client.validation.getCached();
    }

    if (error.code === 'INVALID_LICENSE') {
      console.error('License key is invalid');
      redirectToOnboarding();
    }

    if (error.code === 'DEVICE_MISMATCH') {
      console.error('License not valid for this device');
      showReactivationPrompt();
    }

    if (error.code === 'TIMEOUT') {
      console.error('Request timeout - retrying...');
      // Will auto-retry with backoff
    }

    throw error;
  }
}
```

## DOM Manipulation Examples

### Simple License Status Display

```javascript
async function displayLicenseStatus() {
  const result = await client.validate({
    licenseKey: getStoredKey(),
    deviceId: await DeviceFingerprint.generate(),
  });

  const statusEl = document.getElementById('license-status');

  if (result.valid) {
    statusEl.innerHTML = `
      <div style="color: green;">
        <strong>License Active</strong>
        <p>Tier: ${result.license.tier}</p>
        <p>Expires: ${new Date(result.license.expiresAt).toLocaleDateString()}</p>
      </div>
    `;
  } else {
    statusEl.innerHTML = `
      <div style="color: red;">
        <strong>License Inactive</strong>
        <p>${result.error}</p>
        <a href="/onboarding">Activate License</a>
      </div>
    `;
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', displayLicenseStatus);
```

### Feature-Gated UI

```javascript
function hideUnlicensedFeatures() {
  const license = client.licenses.getCached();

  document.querySelectorAll('[data-feature]').forEach((el) => {
    const feature = el.dataset.feature;
    const requiredTier = el.dataset.tier;

    // Check if feature is available
    const hasFeature = license?.features?.[feature];
    const hasTier = !requiredTier || license?.tier === requiredTier;

    if (!hasFeature || !hasTier) {
      el.style.display = 'none';

      // Show upgrade prompt
      const prompt = document.createElement('div');
      prompt.className = 'upgrade-prompt';
      prompt.innerHTML = `<a href="/plans">Upgrade to access ${feature}</a>`;
      el.parentNode.insertBefore(prompt, el.nextSibling);
    }
  });
}

// Usage in HTML:
// <button data-feature="advancedReporting">Export Reports</button>
// <div data-feature="customBranding" data-tier="enterprise">White-label Settings</div>
```

## Environment Variables

```bash
# .env
LICENSE_SERVER_URL=https://license.yourdomain.com/api
LICENSE_KEY=YOUR-LICENSE-KEY
CACHE_ENABLED=true
DEBUG_MODE=false
```

```javascript
// In your app
const client = new LicenseClient({
  baseUrl: process.env.LICENSE_SERVER_URL,
  cache: process.env.CACHE_ENABLED === 'true',
  debug: process.env.DEBUG_MODE === 'true',
});
```

## Deployment Considerations

### For Browser Applications

```javascript
// Use environment-specific URLs
const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://api.yourdomain.com/license'
    : 'http://localhost:3000/api/license';
```

### For Server-Side (Node.js, Deno)

```javascript
// Validate once and cache
const validateAndCache = async (licenseKey) => {
  const result = await client.validate({
    licenseKey,
    deviceId: os.hostname(), // or custom device ID
  });

  if (result.valid) {
    // Cache result for ~23 hours
    cache.set(licenseKey, result, 82800);
  }

  return result;
};
```

## Performance Tips

1. **Cache aggressively** — license data changes infrequently
2. **Validate once per session** — not on every request
3. **Use device fingerprinting** — compute once on startup
4. **Batch requests** — fetch multiple resources together if needed
5. **Handle offline gracefully** — always have a fallback

## Troubleshooting

### "License not found"

→ Check the license key is spelled correctly → Verify the license exists in your server → Check
cache is not returning stale data

### "Device mismatch"

→ License is bound to a different device → User needs to reactivate or contact support → Or use
offline validation with signature verification

### "Network timeout"

→ Server is slow or unreachable → SDK will auto-retry (default 3 times) → Check your internet
connection → Verify `baseUrl` is correct

## See Also

- [Client Installation](/installation/javascript)
- [License Validation](/guide/license-validation)
- [Feature Gating](/guide/feature-gating)
- [Offline Validation](/guide/offline-validation)
- [API Reference](/api/client)
- [Examples](/examples/)
