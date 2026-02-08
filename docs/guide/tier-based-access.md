# Tier-Based Access

## Overview

License tiers provide a tiered access model where higher tiers unlock more functionality and
capacity. The SDK makes it easy to check and enforce tier requirements.

## License Tiers

The SDK supports three standard license tiers, arranged in a hierarchy:

### Standard (Tier 1)

The basic tier with core functionality:

- Entry-level pricing
- Limited users
- Basic features only
- Good for small organizations
- Example: 10 users, basic reporting

### Pro (Tier 2)

The intermediate tier with advanced features:

- Mid-range pricing
- Medium user limit
- Advanced features
- Good for growing organizations
- Example: 50 users, advanced reporting, exports

### Enterprise (Tier 3)

The premium tier with all features and highest capacity:

- Premium pricing
- Large or unlimited users
- All available features
- Best for large organizations
- Premium support
- Example: Unlimited users, all features, API access, SSO

## Tier Hierarchy

Tiers are hierarchical - a higher tier includes all features of lower tiers:

```
Enterprise (3) ≥ Pro (2) ≥ Standard (1)
```

This means:

- Enterprise tier can use anything labeled for Pro or Standard
- Pro tier can use anything labeled for Standard
- Standard tier cannot access Pro or Enterprise features

## Checking License Tier

### JavaScript/TypeScript

```javascript
const result = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: await DeviceFingerprint.generate(),
});

// Check exact tier
if (result.license.tier === 'pro') {
  console.log('License is Pro tier');
}

// Check if tier meets minimum requirement
const TIER_HIERARCHY = {
  standard: 1,
  pro: 2,
  enterprise: 3,
};

function hasTierOrHigher(license, requiredTier) {
  return TIER_HIERARCHY[license.tier] >= TIER_HIERARCHY[requiredTier];
}

if (hasTierOrHigher(result.license, 'pro')) {
  // License is Pro or Enterprise
  enableAdvancedFeatures();
}
```

### React

```jsx
import { useLicense } from '@universal-license/react';

export function FeatureAccess() {
  const { license } = useLicense('LICENSE-KEY');

  const TIER_HIERARCHY = { standard: 1, pro: 2, enterprise: 3 };

  const hasTierOrHigher = (requiredTier) => {
    if (!license) return false;
    return TIER_HIERARCHY[license.tier] >= TIER_HIERARCHY[requiredTier];
  };

  return (
    <div>
      {hasTierOrHigher('standard') && <div>Standard features enabled</div>}

      {hasTierOrHigher('pro') && <div>Advanced features enabled</div>}

      {hasTierOrHigher('enterprise') && <div>Enterprise features enabled</div>}
    </div>
  );
}
```

### PHP

```php
use UniversalLicense\Facades\License;

$license = License::getCurrentLicense();

if ($license->tier === 'pro') {
    echo "License is Pro tier";
}

// Check tier hierarchy
$tierHierarchy = ['standard' => 1, 'pro' => 2, 'enterprise' => 3];

if ($tierHierarchy[$license->tier] >= $tierHierarchy['pro']) {
    // License is Pro or higher
    showAdvancedFeatures();
}
```

### Laravel

```php
use UniversalLicense\Facades\License;

// Check exact tier
if (License::isProTier()) {
    // Tier is exactly Pro
}

// Check tier or higher
if (License::isTierOrHigher('pro')) {
    // License is Pro or Enterprise
}

// In Blade
@if(License::isTierOrHigher('pro'))
    <div>Pro features content</div>
@endif
```

## Tier-Based Validation

Require a minimum tier when validating:

```javascript
const result = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: await DeviceFingerprint.generate(),
  requiredTier: 'pro',
});

if (!result.valid) {
  if (result.reason === 'TIER_INSUFFICIENT') {
    console.log(`License is ${result.currentTier}, but Pro tier required`);
    showUpgradePrompt(result.currentTier, result.requiredTier);
  }
}
```

The validation automatically checks that the license tier meets or exceeds the required tier.

## Tiered Features

Different tiers typically have different features:

```javascript
{
    standard: {
        features: {
            memberManagement: true,
            basicReporting: true,
            attendance: true
        }
    },
    pro: {
        features: {
            memberManagement: true,      // Also in Standard
            basicReporting: true,        // Also in Standard
            attendance: true,            // Also in Standard
            advancedReporting: true,     // NEW in Pro
            exports: true,               // NEW in Pro
            bulkImport: true             // NEW in Pro
        }
    },
    enterprise: {
        features: {
            // All Standard features
            memberManagement: true,
            basicReporting: true,
            attendance: true,
            // All Pro features
            advancedReporting: true,
            exports: true,
            bulkImport: true,
            // Additional Enterprise features
            sso: true,                   // NEW in Enterprise
            apiAccess: true,             // NEW in Enterprise
            webhooks: true,              // NEW in Enterprise
            dedicatedSupport: true       // NEW in Enterprise
        }
    }
}
```

## User Limits by Tier

Tiers often come with different user limits:

```javascript
const TIER_LIMITS = {
  standard: 10,
  pro: 50,
  enterprise: null, // null = unlimited
};

function canAddNewUser(license, currentUserCount) {
  const limit = TIER_LIMITS[license.tier];

  if (limit === null) {
    return true; // Unlimited
  }

  return currentUserCount < limit;
}

// Usage
const license = result.license;
const currentUsers = getActiveUserCount();

if (canAddNewUser(license, currentUsers)) {
  showAddUserDialog();
} else {
  const limit = TIER_LIMITS[license.tier];
  showError(`User limit (${limit}) reached. Upgrade to add more users.`);
}
```

The `maxUsers` field in the license response indicates the limit for that license:

```javascript
if (result.license.maxUsers) {
  console.log(`User limit: ${result.license.maxUsers}`);
  console.log(`Current users: ${currentUserCount}`);
  console.log(`Users remaining: ${result.license.maxUsers - currentUserCount}`);
}
```

## Tier Upgrade Prompts

When a user tries to access a feature not in their tier, guide them to upgrade:

```javascript
async function attemptToProceedWithFeature() {
  const result = await client.validation.validate({
    licenseKey: licenseKey,
    deviceId: await DeviceFingerprint.generate(),
  });

  // Check if they have required tier
  const TIER_HIERARCHY = { standard: 1, pro: 2, enterprise: 3 };
  const hasRequired = TIER_HIERARCHY[result.license.tier] >= TIER_HIERARCHY['pro'];

  if (!hasRequired) {
    // Show contextual upgrade prompt
    showUpgradeDialog({
      currentTier: result.license.tier,
      requiredTier: 'pro',
      feature: 'Advanced Analytics',
      upgradeLink: '/upgrade',
    });
    return;
  }

  // Tier requirement met - proceed
  proceedWithFeature();
}
```

## React Tier Gates

Create a component that gates content by tier:

```jsx
import { useLicense } from '@universal-license/react';

export function TierGate({ requiredTier, children, fallback }) {
  const { license, isLoading } = useLicense();

  if (isLoading) return <div>Loading...</div>;

  const TIER_HIERARCHY = { standard: 1, pro: 2, enterprise: 3 };

  const hasRequiredTier = license && TIER_HIERARCHY[license.tier] >= TIER_HIERARCHY[requiredTier];

  if (!hasRequiredTier) {
    return (
      fallback || (
        <div className="upgrade-prompt">
          <p>{requiredTier} tier required</p>
          <button onClick={() => (window.location.href = '/upgrade')}>Upgrade Now</button>
        </div>
      )
    );
  }

  return children;
}

// Usage
<TierGate requiredTier="pro" fallback={<UpgradeButton />}>
  <AdvancedFeatures />
</TierGate>;
```

## Common Tier Patterns

### Show Pricing Based on Tier

Display different pricing information based on user's current tier:

```javascript
function showUpgradeOptions(currentTier) {
  const TIERS = {
    standard: { name: 'Standard', price: 299 },
    pro: { name: 'Pro', price: 599 },
    enterprise: { name: 'Enterprise', price: 'Custom' },
  };

  // Show available upgrades
  const tierIndex = ['standard', 'pro', 'enterprise'].indexOf(currentTier);

  const availableUpgrades = ['standard', 'pro', 'enterprise'].slice(tierIndex + 1);

  availableUpgrades.forEach((tier) => {
    const tierInfo = TIERS[tier];
    console.log(`Upgrade to ${tierInfo.name}: $${tierInfo.price}/year`);
  });
}

showUpgradeOptions('standard');
// Output:
// Upgrade to Pro: $599/year
// Upgrade to Enterprise: $Custom/year
```

### Highlight Tier-Specific Features

Show which features are available at each tier:

```jsx
export function TierComparison() {
  const features = [
    { name: 'Member Management', tiers: ['standard', 'pro', 'enterprise'] },
    { name: 'Advanced Reporting', tiers: ['pro', 'enterprise'] },
    { name: 'API Access', tiers: ['enterprise'] },
    { name: 'SSO', tiers: ['enterprise'] },
  ];

  return (
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Standard</th>
          <th>Pro</th>
          <th>Enterprise</th>
        </tr>
      </thead>
      <tbody>
        {features.map((feature) => (
          <tr key={feature.name}>
            <td>{feature.name}</td>
            {['standard', 'pro', 'enterprise'].map((tier) => (
              <td key={tier}>{feature.tiers.includes(tier) ? '✓' : ''}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Enforce Tier Limits in Forms

Prevent tier-insufficient actions at the UI level:

```jsx
export function AddTeamMemberForm({ license }) {
  const TIER_LIMITS = { standard: 10, pro: 50, enterprise: null };
  const [members, setMembers] = useState([]);

  const limit = TIER_LIMITS[license.tier];
  const isFull = limit && members.length >= limit;

  return (
    <div>
      <p>
        Team Members: {members.length}
        {limit ? `/${limit}` : ''}
      </p>

      <button disabled={isFull}>{isFull ? `Limit reached (${limit})` : 'Add Member'}</button>

      {isFull && <p className="text-muted">Upgrade to add more members</p>}
    </div>
  );
}
```

## Next Steps

- [License Validation](/guide/license-validation) - Validate tier requirements
- [Feature Gating](/guide/feature-gating) - Control individual features
- [Error Handling](/guide/error-handling) - Handle tier violations
