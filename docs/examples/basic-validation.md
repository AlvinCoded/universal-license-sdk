# Basic Validation Example

Validate a license key using the SDK on app startup - the most common use case.

## Overview

This example demonstrates:

- Calling `client.validation.validate()` with license key and device ID
- Checking the `result.valid` property
- Accessing license data from `result.license`
- Handling errors and offline scenarios with caching

## Complete Implementation

```typescript
import { LicenseClient } from '@unilic/client';
import { DeviceFingerprint } from '@unilic/core';

// Initialize the client
const client = new LicenseClient({
  baseUrl: 'https://license-server.example.com/api',
  // Required for public endpoints (multi-application)
  appKey: 'YOUR_APP_KEY',
});

type StoredValidation = {
  licenseKey: string;
  deviceId: string;
  validatedAt: string;
  license: {
    licenseKey: string;
    tier: 'standard' | 'pro' | 'enterprise';
    features: Record<string, boolean>;
    maxUsers?: number;
    orgName: string;
    productCode: string;
    expiresAt: string;
    daysUntilExpiry?: number;
  };
  signature?: string;
  signatureKid?: string;
};

const VALIDATION_STORAGE_KEY = 'uls:lastValidation';

function saveValidation(data: StoredValidation) {
  localStorage.setItem(VALIDATION_STORAGE_KEY, JSON.stringify(data));
}

function loadValidation(): StoredValidation | null {
  try {
    const raw = localStorage.getItem(VALIDATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Main app initialization
 * Called when app starts
 */
async function initApp() {
  try {
    // Step 1: Get stored license key
    const licenseKey = localStorage.getItem('licenseKey');

    if (!licenseKey) {
      console.log('No license found');
      redirectToOnboarding();
      return;
    }

    console.log('Validating stored license...');

    // Step 2: Get or create a stable device fingerprint
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = await DeviceFingerprint.generate();
      localStorage.setItem('deviceId', deviceId);
    }

    // Step 3: Call client.validation.validate()
    // This is the SDK method that performs validation
    const result = await client.validation.validate({
      licenseKey,
      deviceId,
      // Optional: require specific tier or features
      // requiredTier: 'pro',
      // requiredFeatures: ['advancedReporting']
    });

    // Step 4: Check result
    if (result.valid) {
      // ✓ License is valid
      const license = result.license;

      if (license) {
        saveValidation({
          licenseKey,
          deviceId,
          validatedAt: new Date().toISOString(),
          license,
          signature: result.signature,
          signatureKid: result.signatureKid,
        });
      }

      // Optional (advanced): verify the signature offline
      // - Fetch keyset: `await client.validation.getPublicKeySet()`
      // - Verify with `verifySignatureWithKeySet(...)` using `result.signatureKid`

      // Optional: you can use the SDK convenience helper to read cached license instantly:
      // const cached = await client.getCachedLicense(licenseKey);
      // if (cached) { /* immediate offline-safe rendering */ }

      console.log('✓ License valid!');
      console.log(`Organization: ${license.orgName}`);
      console.log(`Tier: ${license.tier}`);
      console.log(`Expires: ${license.expiresAt}`);
      console.log('Features:', license.features);

      // Enable app features based on license
      enableAppFeatures(license);
    } else {
      // ✗ License validation failed
      console.error('✗ License invalid');
      console.error('Error:', result.error);
      console.error('Reason:', result.reason);

      handleValidationError(result);
    }
  } catch (error) {
    // Network error or SDK error
    console.error('Validation error:', error);

    // Offline fallback: use last stored validation result (if any)
    const cached = loadValidation();
    const licenseKey = localStorage.getItem('licenseKey');
    const deviceId = localStorage.getItem('deviceId');

    if (
      cached &&
      cached.licenseKey === licenseKey &&
      cached.deviceId === deviceId &&
      new Date(cached.license.expiresAt) > new Date()
    ) {
      console.log('Using stored validation (offline)');
      enableAppFeatures(cached.license);
    } else {
      redirectToOnboarding();
    }
  }
}

/**
 * Enable features based on license data
 */
function enableAppFeatures(license) {
  // 1. Check tier
  if (license.tier === 'pro' || license.tier === 'enterprise') {
    document.querySelector('[data-feature="advanced"]').style.display = 'block';
  }

  // 2. Check specific features
  if (license.features?.advancedReporting === true) {
    enableReporting();
  }

  if (license.features?.multiLocation === true) {
    enableMultiLocation();
  }

  // 3. Check expiration
  const daysLeft = getDaysUntilExpiry(license.expiresAt);
  if (daysLeft <= 0) {
    showExpiredBanner();
  } else if (daysLeft <= 30) {
    showRenewalBanner(daysLeft);
  }
}

/**
 * Handle validation failure scenarios
 */
function handleValidationError(result) {
  switch (result.reason) {
    case 'INVALID_KEY':
      // License key doesn't exist
      console.log('License not found - redirect to onboarding');
      redirectToOnboarding();
      break;

    case 'EXPIRED':
      // License date has passed
      console.log('License expired');
      showMessage(`License expired on ${new Date(result.license?.expiresAt).toLocaleDateString()}`);
      showRenewalCTA();
      break;

    case 'REVOKED':
      // License was revoked
      console.log('License was revoked');
      showMessage(result.error || 'License was revoked');
      break;

    case 'INSUFFICIENT_TIER':
      // User's tier is lower than required
      console.log(`Need ${result.requiredTier}, have ${result.currentTier}`);
      showUpgradePrompt(result.requiredTier);
      break;

    case 'MISSING_FEATURES':
      // License is missing required features
      const missing = result.missingFeatures?.join(', ');
      console.log(`Missing features: ${missing}`);
      showMessage(`Missing features: ${missing}`);
      break;

    default:
      console.error('Unknown validation error');
      redirectToOnboarding();
  }
}

function getDaysUntilExpiry(expiresAt) {
  const expiryDate = new Date(expiresAt);
  return Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
}

function redirectToOnboarding() {
  window.location.href = '/onboarding';
}

function showExpiredBanner() {
  document.getElementById('expiredBanner').style.display = 'block';
}

function showRenewalBanner(daysLeft) {
  document.getElementById('renewalBanner').textContent = `License expires in ${daysLeft} days`;
  document.getElementById('renewalBanner').style.display = 'block';
}

function showRenewalCTA() {
  document.getElementById('renewalCTA').style.display = 'block';
}

function showUpgradePrompt(tier) {
  document.getElementById('upgradeCTA').style.display = 'block';
  document.getElementById('upgradeCTA').textContent = `Upgrade to ${tier}`;
}

function showMessage(msg) {
  document.getElementById('message').textContent = msg;
  document.getElementById('message').style.display = 'block';
}

function enableReporting() {
  document.getElementById('reportingTab').classList.remove('disabled');
}

function enableMultiLocation() {
  document.getElementById('locationPicker').style.display = 'block';
}

// Initialize on page load
window.addEventListener('load', initApp);
```

## Validation Result Structure

The SDK returns this structure:

```typescript
// Success
{
  valid: true,
  license: {
    licenseKey: 'PROD-ORG-2025-XXXX',
    tier: 'pro',              // 'standard', 'pro', 'enterprise'
    features: {               // Feature flags
      advancedReporting: true,
      multiLocation: true,
      exportData: false
    },
    maxUsers: 50,
    orgName: 'Acme Corp',
    productCode: 'PROD',
    expiresAt: '2025-12-31T23:59:59Z'
  }
}

// Failure
{
  valid: false,
  error: 'License expired',
  reason: 'EXPIRED',  // Error reason code
  license: { ... }    // May include partial data
}
```

## Common Patterns

### Pattern 1: Require Specific Tier

```typescript
const result = await client.validation.validate({
  licenseKey,
  deviceId,
  requiredTier: 'pro', // Will fail if user has 'standard'
});

if (result.reason === 'INSUFFICIENT_TIER') {
  showUpgradePrompt();
}
```

### Pattern 2: Require Specific Features

```typescript
const result = await client.validation.validate({
  licenseKey,
  deviceId,
  requiredFeatures: ['advancedReporting', 'exportData'],
});

if (result.reason === 'MISSING_FEATURES') {
  // result.license?.missingFeatures contains the list
  disableFeatures(result.license.missingFeatures);
}
```

### Pattern 3: Offline with Cache

```typescript
let validation;
try {
  validation = await client.validation.validate({ licenseKey, deviceId });
} catch (error) {
  // Network failed
  const cached = loadValidation();
  if (!cached || cached.licenseKey !== licenseKey || cached.deviceId !== deviceId) {
    throw error;
  }
  if (new Date(cached.license.expiresAt) <= new Date()) {
    throw new Error('Cached license expired');
  }
  console.log('Using stored validation, offline');
  validation = { valid: true, license: cached.license };
}

if (validation.valid) {
  enableApp(validation.license);
}
```

## Next Steps

- [Onboarding Flow](/examples/onboarding-flow) — Get initial license
- [Payment Integration](/examples/payment-integration) — Handle purchases
- [Dashboard Integration](/examples/dashboard-integration) — Show license info
