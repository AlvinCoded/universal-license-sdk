# Core Concepts

## License Structure

Every license consists of several components:

### License Key

A unique identifier for the license:

```
PROD-ORG-2025-XXXX-XXXX-XXXX
```

Format: `PRODUCT-ORG-YEAR-XXXX-XXXX-XXXX`

- **PRODUCT:** Product code (e.g., PROD, APP-SUITE)
- **ORG:** Organization initials (3 letters)
- **YEAR:** Year of issue
- **XXXX-XXXX-XXXX:** Random hex strings for uniqueness

### License Data

Associated information stored on your server:

```json
{
  "licenseKey": "PROD-ORG-2025-XXXX-XXXX-XXXX",
  "orgName": "Example Organization",
  "ownerName": "Jane Doe",
  "productCode": "PROD",
  "planCode": "PROD-PRO",
  "tier": "pro",
  "status": "active",
  "maxUsers": 50,
  "issuedAt": "2025-01-15",
  "expiresAt": "2026-01-15",
  "autoRenew": true,
  "features": {
    "memberManagement": true,
    "advancedReporting": true,
    "financialManagement": true
  }
}
```

## Tiers

Licenses come in three tiers, each with increasing capabilities:

### 1. Standard

- **Price:** Lowest
- **Users:** Small limit (e.g., 10)
- **Features:** Core features only
- **Best for:** Small organizations, trials

**Example features:**

- Basic member management
- Simple reports
- Email support

### 2. Pro

- **Price:** Medium
- **Users:** Medium limit (e.g., 50)
- **Features:** Advanced features
- **Best for:** Growing organizations, production use

**Example features:**

- Advanced member management
- Detailed analytics
- Custom reports
- Priority support

### 3. Enterprise

- **Price:** Highest
- **Users:** Large limit or unlimited
- **Features:** All features + premium support
- **Best for:** Large organizations, critical operations

**Example features:**

- Everything in Pro
- Unlimited users
- SSO (if supported)
- Dedicated support
- SLA guarantee

### Tier Hierarchy

Tiers have a hierarchy - higher tiers include all lower tier features:

```
Enterprise (3) ≥ Pro (2) ≥ Standard (1)
```

When checking tier requirements:

```javascript
const TIER_ORDER = { standard: 1, pro: 2, enterprise: 3 };
const hasTier = (currentTier, requiredTier) => TIER_ORDER[currentTier] >= TIER_ORDER[requiredTier];

// Enterprise license can use Pro features
if (hasTier('enterprise', 'pro')) {
  // ✅ True - Enterprise >= Pro
}

// But not vice versa
if (hasTier('standard', 'pro')) {
  // ❌ False - Standard < Pro
}
```

## Features & Feature Gates

### What are Features?

Features are individual capabilities that can be enabled or disabled per tier/license:

```json
{
  "features": {
    "memberManagement": true,
    "advancedReporting": true,
    "multiLocation": false,
    "sso": false,
    "apiAccess": true
  }
}
```

### Feature Gating

**Feature gating** means controlling UI/functionality based on license features:

```javascript
// Show/hide UI based on feature
if (license.features.advancedReporting) {
  // Show advanced reporting menu
} else {
  // Show basic reports only
}
```

Not the same as tier checking:

- **Tier:** License type (standard/pro/enterprise)
- **Features:** Individual capabilities (reporting, exports, etc.)

A Pro license might not have `sso` feature, while an Enterprise license would.

### Implementing Feature Gates

**JavaScript:**

```javascript
import { FeatureGate } from '@unilic/react';

<FeatureGate feature="advancedReporting">
    <ReportingDashboard />
</FeatureGate>

// If feature not enabled, shows nothing by default
// Or with fallback:
<FeatureGate
    feature="advancedReporting"
    fallback={<BasicReporting />}
>
    <AdvancedReporting />
</FeatureGate>
```

**PHP:**

```php
if ($license->features['advancedReporting'] ?? false) {
    // Load advanced reporting module
}
```

## Device Binding

### What is Device Binding?

Device binding ties a license to a specific device/server to prevent:

- License sharing across devices
- Concurrent usage on multiple devices
- Unauthorized copying

### How it Works

1. **Generate device fingerprint** - Unique identifier for device

   ```javascript
   const deviceId = await DeviceFingerprint.generate();
   // Returns: sha256 hash of device characteristics
   ```

2. **Include in validation** - Send with license validation

   ```javascript
   const result = await client.validation.validate({
     licenseKey: '...',
     deviceId: deviceId, // ← Device identifier
   });
   ```

3. **Server checks binding** - Compares with license record
   - If binding matches: ✅ Valid
   - If binding differs: ❌ Invalid device

### Device Fingerprinting by Platform

**Browser (JavaScript):**

```javascript
// Fingerprint based on:
// - User agent
// - Screen resolution
// - Timezone
// - Language
// - Browser plugins (if available)
```

**WordPress:**

```php
$deviceId = DeviceFingerprint::generateForWordPress();
// Fingerprint based on:
// - WordPress installation path
// - Database name
// - Site URL
// - WP version
```

**Laravel:**

```php
$deviceId = DeviceFingerprint::generateForLaravel();
// Fingerprint based on:
// - Laravel base path
// - App name
// - App URL
// - Database name
```

### Optional Device Binding

You can issue licenses with or without device binding:

```javascript
// Without binding - works on any device
const result = await client.validation.validate({
  licenseKey: 'KEY-1',
  // No deviceId required
});

// With binding - only works on specific device
const result = await client.validation.validate({
  licenseKey: 'KEY-2',
  deviceId: 'abc123def456...',
  // Must match device that license was bound to
});
```

## Expiration & Grace Periods

### License Expiration

Every license has an expiration date:

```
Issued: 2025-01-15
Expires: 2026-01-15
Period: 365 days
```

### Grace Period

A grace period extends validity after expiration (typically 30 days):

```
Expires: 2026-01-15
Grace ends: 2026-02-14 (30 days)

Period 1 (Jan 15 - Feb 14): ✅ Valid, grace applied
Period 2 (After Feb 14): ❌ Completely expired
```

Usage:

```javascript
const daysLeft = daysUntilExpiry(license.expiresAt);
const isExpired = isLicenseExpired(license.expiresAt);
const inGracePeriod = isExpired && daysLeft > -30;

if (inGracePeriod) {
  // License expired, but in 30-day grace period
  showGracePeriodWarning();
} else if (isExpired) {
  // Grace period over
  denyAccess();
}
```

### Renewal

When a license expires, it can be renewed for additional time:

```javascript
// Process a renewal for additional time
// (typically called after your payment provider confirms payment)
const renewed = await client.renewals.renew({
  licenseKey,
  durationDays: 365,
  paymentReference: 'pi_...',
});

// New expiration: 2027-02-14
```

This is different from auto-renewal (which happens automatically on expiration).

## Status States

Every license has a status reflecting its current state:

### Active ✅

- License is valid and in use
- Validation succeeds
- All features available

### Expired ⏰

- Past expiration date (outside grace period)
- Validation fails with "LICENSE_EXPIRED"
- Needs renewal

### Revoked 🚫

- Administrator manually revoked it
- Validation fails with "LICENSE_REVOKED"
- Cannot be reactivated (new license required)

### Suspended ⛔

- Temporarily disabled (e.g., non-payment)
- Validation fails
- Can be reactivated by admin

### Pending ⏳

- Generated but not yet activated
- May require user action to activate
- Not yet valid for use

State transitions:

```
Pending → Active → Expired → (Revoked or Renewed)
```

## Organizations & Users

### Organization

A business entity that owns licenses:

```json
{
  "orgName": "Example Organization",
  "orgType": "Company",
  "ownerName": "Jane Doe",
  "ownerEmail": "owner@example.com",
  "address": "123 Example St, City",
  "phone": "+1-555-1234",
  "country": "USA"
}
```

### Max Users

Some licenses limit concurrent users:

```
License tier: Pro
Max users: 50

Active users: 48
→ Can add 2 more users

Active users: 50
→ Cannot add more (at limit)
```

Enforced in your application:

```javascript
if (activeUsers < license.maxUsers) {
  allowNewUser();
} else {
  showLimitExceeded(license.maxUsers);
}
```

## Purchase Flow

Complete flow from purchase to activated license:

```
1. Customer selects plan
   ↓
2. Create purchase order
   POST /purchases/create-order
   ↓
3. Process payment
   (via Stripe, PayPal, etc.)
   ↓
4. Complete purchase
   POST /purchases/complete-purchase
   ↓
5. License auto-generated
   ↓
6. Send to customer
   (email, portal, etc.)
   ↓
7. Customer activates
   Validate license in application
   ↓
8. License active
```

SDK methods for each step:

```javascript
// Step 2: Create order
const order = await client.purchases.createOrder({
    planCode: 'PROD-PRO',
    organizationData: { ... }
});

// Step 3: Process payment (your payment gateway)
const paymentResult = await stripeClient.processPayment({
    amount: order.order.amount,
    metadata: { orderId: order.order.orderId }
});

// Step 4: Complete purchase
const result = await client.purchases.completePurchase(
    order.order.orderId,
    paymentResult.id
);

// Step 5-8: License created and ready
const license = result.license;
```

## Validation

### What Validation Checks

When you validate a license, the server checks:

1. **License exists** - Key is in database
2. **License is active** - Status is 'active'
3. **License not expired** - Current date < expiration date
4. **Device matches** (if bound) - Device fingerprint matches stored value
5. **Tier meets requirement** (if specified) - License tier ≥ required tier
6. **Features exist** (if specified) - All required features are enabled

### Validation Response

```javascript
{
    valid: true/false,
    license: {
        // License data if valid
    },
    error: "License expired",  // If invalid
    reason: "EXPIRED",         // Error code
    currentTier: "standard",   // If tier mismatch
    requiredTier: "pro",
    missingFeatures: ["reporting"]  // If feature mismatch
}
```

### Offline Validation

SDK can validate using **cached data** to reduce network calls, and you can do an offline-only
cached check when the network is unavailable:

```javascript
// First validation (requires internet)
// (With caching enabled, this result is cached automatically)
const result = await client.validate({
  licenseKey,
  deviceId,
});

// Later: offline-only cached check
// Returns false if there is no cached entry
const isValidOffline = await client.validation.isValidCached(licenseKey);
```

For maximum security, verify RSA signature:

```javascript
import { verifySignature } from '@unilic/client';

if (
  await verifySignature(
    cachedLicense,
    licenseSignature,
    publicKey // Get from server
  )
) {
  // Data is authentic
}
```

## Summary

| Concept                | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| **License Key**        | Unique identifier                                  |
| **Tier**               | License level (standard/pro/enterprise)            |
| **Features**           | Individual capabilities (reporting, exports, etc.) |
| **Device Binding**     | Tie license to specific device                     |
| **Expiration**         | License validity period                            |
| **Grace Period**       | Extended use after expiration                      |
| **Status**             | Current state (active, expired, revoked, etc.)     |
| **Max Users**          | Concurrent user limit                              |
| **Validation**         | Check if license is valid                          |
| **Offline Validation** | Validate using cached data                         |

---

## Next Steps

Dive deeper into specific topics:

- [License Validation](/guide/license-validation) - How validation works
- [Device Fingerprinting](/guide/device-fingerprinting) - Unique device IDs
- [Feature Gating](/guide/feature-gating) - Control feature access
- [Tier-Based Access](/guide/tier-based-access) - License tiers
