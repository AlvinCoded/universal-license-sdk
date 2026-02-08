# License Renewal and Expiration

## Overview

Licenses have expiration dates and can be renewed to extend their validity. The SDK provides
utilities to check expiration status and manage renewal workflows.

## Checking License Expiration

### Get Expiration Date

```javascript
const result = await client.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: 'device-123',
});

const expiresAt = result.license.expiresAt;
console.log(`License expires: ${new Date(expiresAt).toLocaleDateString()}`);
```

The `expiresAt` field contains an ISO 8601 date string indicating when the license becomes invalid.

### Calculate Days Until Expiry

```javascript
import { daysUntilExpiry } from '@unilic/client';

const daysLeft = daysUntilExpiry('2025-12-31T23:59:59Z');

if (daysLeft <= 0) {
  console.log('License has expired');
} else if (daysLeft <= 30) {
  console.log(`License expires in ${daysLeft} days`);
} else {
  console.log('License is valid for a while');
}
```

This utility calculates the number of days between now and the expiration date. Negative values
indicate an expired license.

### Check if License is Expired

```javascript
import { isLicenseExpired } from '@unilic/client';

const expired = isLicenseExpired('2024-06-15T23:59:59Z');

if (expired) {
  showRenewalPrompt();
} else {
  allowNormalOperation();
}
```

This is a simple boolean check - returns true if the license has already expired.

## Expiration Warnings

Implement expiration warnings to notify users before their license expires:

```javascript
function getExpiryWarning(expiresAt) {
  const daysLeft = daysUntilExpiry(expiresAt);

  if (daysLeft <= 0) {
    return {
      level: 'critical',
      message: 'License has expired',
      daysLeft: 0,
    };
  }

  if (daysLeft <= 7) {
    return {
      level: 'critical',
      message: `License expires in ${daysLeft} days`,
      daysLeft,
    };
  }

  if (daysLeft <= 30) {
    return {
      level: 'warning',
      message: `License expires in ${daysLeft} days`,
      daysLeft,
    };
  }

  if (daysLeft <= 90) {
    return {
      level: 'info',
      message: `License expires in ${daysLeft} days`,
      daysLeft,
    };
  }

  return {
    level: 'none',
    message: null,
    daysLeft,
  };
}
```

Use this in your UI to show different warning levels:

```javascript
const warning = getExpiryWarning(license.expiresAt);

if (warning.level === 'critical') {
  showCriticalExpiryBanner(warning.message); // Red banner
} else if (warning.level === 'warning') {
  showWarningBanner(warning.message); // Orange banner
} else if (warning.level === 'info') {
  showInfoBanner(warning.message); // Blue banner
}
```

## Renewal Workflows

### Check Renewal Eligibility

Before renewing, verify the license can be renewed:

```javascript
const result = await client.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: 'device-123',
});

// Licenses can be renewed regardless of status (active, expired, etc.)
// But they must exist
if (result.valid || result.reason === 'EXPIRED') {
  // Can renew
  showRenewalOptions();
} else if (result.reason === 'REVOKED') {
  // Cannot renew revoked licenses
  showError('This license was revoked and cannot be renewed');
}
```

### Request License Renewal

Create a renewal request through the purchase system:

```javascript
// Method 1: Through purchase API
const order = await client.purchases.createOrder({
  planCode: license.planCode, // Renew for same plan
  organizationData: {
    orgName: license.orgName,
    ownerName: license.ownerName,
    ownerEmail: license.ownerEmail,
  },
  renewalOf: license.licenseKey, // Optional: indicate this is a renewal
});

console.log(`Renewal order created: ${order.orderId}`);
```

The purchase system creates an order for the renewal. After payment is processed, the license is
renewed.

### Complete Renewal Payment

After payment gateway processes the payment:

```javascript
const result = await client.purchases.completePurchase({
  orderId: order.orderId,
  paymentReference: 'stripe_payment_intent_id',
});

if (result.success) {
  console.log('License renewed!');
  console.log(`New expiration: ${result.license.expiresAt}`);
}
```

The renewal extends the license expiration date. The same license key remains valid.

## Auto-Renewal

Some licenses support automatic renewal on expiration:

```javascript
// Check if auto-renewal is enabled
const result = await client.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: 'device-123',
});

const autoRenewEnabled = result.license.autoRenewal === true;

if (autoRenewEnabled) {
  console.log('License will automatically renew on expiration');
} else {
  console.log('Manual renewal required');
}
```

Auto-renewal requires:

1. Valid payment method on file
2. Auto-renewal explicitly enabled
3. Sufficient time to process renewal before expiration

## Renewal Notifications

Monitor for licenses that need renewal:

```javascript
async function checkAndNotifyRenewals() {
  const licenses = await client.licenses.getAll();

  for (const license of licenses) {
    const daysLeft = daysUntilExpiry(license.expiresAt);

    // Send notifications at key intervals
    if (daysLeft === 90) {
      sendEmailNotification(license.ownerEmail, '90 days until renewal');
    } else if (daysLeft === 30) {
      sendEmailNotification(license.ownerEmail, '30 days until renewal');
    } else if (daysLeft === 7) {
      sendEmailNotification(license.ownerEmail, '7 days until renewal - action required');
    } else if (daysLeft === 0) {
      sendEmailNotification(license.ownerEmail, 'License expired - renew now');
    }
  }
}

// Run daily check
setInterval(checkAndNotifyRenewals, 24 * 60 * 60 * 1000);
```

## React Renewal Components

```jsx
import { useLicense } from '@unilic/react';
import { daysUntilExpiry } from '@unilic/client';

export function RenewalStatus({ licenseKey }) {
  const { license, loading } = useLicense(licenseKey);

  if (loading) return <div>Loading...</div>;
  if (!license) return <div>License not found</div>;

  const daysLeft = daysUntilExpiry(license.expiresAt);
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 30;
  const isExpired = daysLeft <= 0;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border',
        isExpired && 'bg-red-50 border-red-200',
        isExpiringSoon && 'bg-yellow-50 border-yellow-200',
        !isExpiringSoon && !isExpired && 'bg-green-50 border-green-200'
      )}
    >
      {isExpired ? (
        <div>
          <h3 className="font-semibold text-red-900">License Expired</h3>
          <p className="text-sm text-red-700">
            Expired on {new Date(license.expiresAt).toLocaleDateString()}
          </p>
          <button onClick={onRenew} className="mt-2 btn btn-primary">
            Renew License
          </button>
        </div>
      ) : isExpiringSoon ? (
        <div>
          <h3 className="font-semibold text-yellow-900">Expiring Soon</h3>
          <p className="text-sm text-yellow-700">
            {daysLeft} days remaining (expires {new Date(license.expiresAt).toLocaleDateString()})
          </p>
          <button onClick={onRenew} className="mt-2 btn btn-secondary">
            Renew Now
          </button>
        </div>
      ) : (
        <div>
          <h3 className="font-semibold text-green-900">Active</h3>
          <p className="text-sm text-green-700">
            Expires in {daysLeft} days ({new Date(license.expiresAt).toLocaleDateString()})
          </p>
        </div>
      )}
    </div>
  );
}
```

## Grace Periods

Some systems allow a grace period after expiration during which licenses still work:

```javascript
const GRACE_PERIOD_DAYS = 14;

async function validateWithGracePeriod(licenseKey, deviceId) {
  const result = await client.validate({
    licenseKey,
    deviceId,
  });

  if (result.valid) {
    return result; // Still active
  }

  if (result.reason === 'EXPIRED') {
    const daysExpired = Math.abs(daysUntilExpiry(result.license.expiresAt));

    if (daysExpired <= GRACE_PERIOD_DAYS) {
      // Still within grace period
      showGracePeriodWarning(`${daysExpired} days in grace period`);
      return result; // Allow access
    } else {
      // Past grace period
      showRenewalRequired();
      return null; // Deny access
    }
  }

  // Other failures
  return null;
}
```

## Expiration Policies

Implement policies for how your application handles expiration:

```javascript
const EXPIRATION_POLICY = {
  // User can still access for 30 days after expiration
  gracePeriod: 30,

  // Warn user when 7 days or less remain
  warningThreshold: 7,

  // Auto-renew if possible
  autoRenew: true,

  // Remind user daily if expiring
  reminderFrequency: 'daily',
};

async function enforceExpirationPolicy(license) {
  const daysLeft = daysUntilExpiry(license.expiresAt);

  if (daysLeft > 0) {
    if (daysLeft <= EXPIRATION_POLICY.warningThreshold) {
      // Show renewal prompt
      showRenewalPrompt(license, daysLeft);
    }
    return true; // Allow access
  }

  if (daysLeft <= 0) {
    const daysExpired = Math.abs(daysLeft);

    if (daysExpired <= EXPIRATION_POLICY.gracePeriod) {
      // Within grace period
      showGracePeriodNotice(daysExpired);
      return true; // Allow access
    } else {
      // Past grace period
      showRenewalRequired();
      return false; // Deny access
    }
  }
}
```

## Next Steps

- [License Validation](/guide/license-validation) - Validate licenses
- [Purchase Workflow](/guide/purchase-workflow) - Create purchase orders for renewal
- [Feature Gating](/guide/feature-gating) - Control features based on license status
