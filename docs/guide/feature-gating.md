# Feature Gating

## Overview

Feature gating (also called feature flagging) allows you to control which features of your
application are available based on the user's license. Different tiers and licenses can have
different features enabled.

## What is Feature Gating?

Feature gating means conditionally showing or hiding functionality based on whether the user's
license includes that feature.

For example:

- **Standard tier**: Basic member management, simple reports
- **Pro tier**: Advanced member management, detailed analytics, exports
- **Enterprise tier**: Everything in Pro, plus SSO, API access, dedicated support

## License Features

Every license has a `features` object that specifies which features are enabled:

```javascript
{
    memberManagement: true,
    advancedReporting: true,
    financialManagement: true,
    multiLocation: false,
    sso: false,
    apiAccess: true
}
```

Each feature is a boolean indicating whether it's enabled (true) or not (false).

## Getting License Features

### JavaScript/TypeScript

```javascript
const result = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: await DeviceFingerprint.generate(),
});

// Check individual features
if (result.license.features.advancedReporting) {
  // Show advanced reporting UI
  showAdvancedReporting();
} else {
  // Show basic reporting only
  showBasicReporting();
}

// Check multiple features
const hasAllAnalytics =
  result.license.features.basicReporting && result.license.features.advancedReporting;

if (hasAllAnalytics) {
  showFullAnalyticsDashboard();
}
```

### React with Hooks

```jsx
import { useFeatureFlag } from '@unilic/react';

export function Dashboard() {
  const hasAdvancedReporting = useFeatureFlag('advancedReporting');
  const hasExports = useFeatureFlag('exports');

  return (
    <div>
      <h1>Dashboard</h1>

      {hasAdvancedReporting && (
        <section>
          <h2>Advanced Reports</h2>
          {/* Detailed reports */}
        </section>
      )}

      {hasExports && <button>Export Data</button>}

      {!hasExports && <p>Data export requires Pro tier</p>}
    </div>
  );
}
```

The `useFeatureFlag` hook checks the current license and returns whether that feature is enabled.

### React with Components

```jsx
import { FeatureGate } from '@unilic/react';

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Only show if feature is enabled */}
      <FeatureGate feature="advancedReporting">
        <AdvancedReportingSection />
      </FeatureGate>

      {/* Show fallback if feature not available */}
      <FeatureGate
        feature="apiAccess"
        fallback={
          <div className="upgrade-prompt">
            <p>API access requires Enterprise tier</p>
            <button onClick={showUpgradeForm}>Upgrade Now</button>
          </div>
        }
      >
        <APIKeysManager />
      </FeatureGate>
    </div>
  );
}
```

The `<FeatureGate>` component automatically handles checking the feature and rendering either the
content or a fallback.

### PHP

```php
use UniversalLicense\Facades\License;

$license = License::getCurrentLicense();

if ($license && $license->features['advancedReporting'] ?? false) {
    // Show advanced reporting
    echo view('reports/advanced');
} else {
    // Show basic reporting
    echo view('reports/basic');
}
```

### Laravel Blade

```blade
@php
    $license = auth()->user()->license;
@endphp

<div>
    <h1>Dashboard</h1>

    {{-- Only show if feature enabled --}}
    @if($license && $license->features['advancedReporting'] ?? false)
        @include('sections.advanced-reporting')
    @endif

    {{-- Show upgrade prompt if feature not available --}}
    @if(!($license && $license->features['apiAccess'] ?? false))
        <div class="upgrade-prompt">
            <p>API access requires Enterprise tier</p>
            <a href="/upgrade">Upgrade Now</a>
        </div>
    @else
        @include('sections.api-management')
    @endif
</div>
```

## Common Feature Gating Patterns

### Simple Feature Check

Check if a single feature is enabled before performing an action:

```javascript
async function attemptExport() {
  const result = await client.validation.validate({
    licenseKey: licenseKey,
    deviceId: await DeviceFingerprint.generate(),
  });

  if (!result.license.features.exports) {
    showUpgradePrompt('Exporting requires Pro tier');
    return;
  }

  // Feature is enabled - proceed with export
  await performExport();
}
```

### Multiple Features Check

Check if several features are all available:

```javascript
const canUsePremium = (license) => {
  return (
    license.features.advancedReporting && license.features.exports && license.features.multiLocation
  );
};

if (canUsePremium(result.license)) {
  showPremiumDashboard();
} else {
  showStandardDashboard();
}
```

### Feature-Based UI Rendering

Conditionally render different UI based on available features:

```jsx
export function ReportingSection({ license }) {
  return (
    <div>
      <h2>Reports</h2>

      {/* Always available */}
      <button>View Basic Reports</button>

      {/* Only if feature enabled */}
      {license.features.advancedReporting && (
        <>
          <button>View Advanced Reports</button>
          <button>Custom Report Builder</button>
        </>
      )}

      {/* Show message if feature not available */}
      {!license.features.advancedReporting && (
        <p className="text-muted">Advanced reports available in Pro tier</p>
      )}
    </div>
  );
}
```

### Progressive Feature Disclosure

Show basic version by default, advanced version if feature available:

```javascript
function initializeApp(license) {
  // Core features always available
  loadBasicUI();

  // Premium features if enabled
  if (license.features.advancedAnalytics) {
    loadAnalyticsDashboard();
  }

  if (license.features.customization) {
    loadThemeCustomizer();
  }

  if (license.features.integrations) {
    loadIntegrationsPanel();
  }
}
```

## Storing and Caching Features

For web applications, store the feature list after validation to avoid repeated checks:

```javascript
// Store features after validation
const result = await client.validation.validate({ licenseKey, deviceId });

if (result.valid) {
  localStorage.setItem('licenseFeatures', JSON.stringify(result.license.features));
}

// Later, use stored features (no API call needed)
function hasFeature(featureName) {
  const features = JSON.parse(localStorage.getItem('licenseFeatures') || '{}');
  return features[featureName] === true;
}

// Use throughout app
if (hasFeature('advancedReporting')) {
  showAdvancedReporting();
}
```

Remember to re-validate periodically to ensure the license and features haven't changed:

```javascript
// Validate daily to refresh features
setInterval(
  async () => {
    const result = await client.validation.validate({ licenseKey, deviceId });

    if (result.valid) {
      // Update stored features
      localStorage.setItem('licenseFeatures', JSON.stringify(result.license.features));
    }
  },
  24 * 60 * 60 * 1000
); // 24 hours
```

## Handling Missing Features

When a user tries to access a feature they don't have, provide clear feedback:

```javascript
async function attemptToUseFeature(featureName) {
  const result = await client.validation.validate({
    licenseKey: licenseKey,
    deviceId: await DeviceFingerprint.generate(),
  });

  if (!result.license.features[featureName]) {
    // Feature not available - show helpful message
    showFeatureUpgradeDialog({
      feature: featureName,
      tier: result.license.tier,
      message: `${featureName} requires a higher tier`,
    });
    return;
  }

  // Proceed with feature
  executeFeature(featureName);
}
```

## Common Features

While features are customizable per license, here are common ones:

**Basic Features:**

- `memberManagement` - Add/edit/remove members
- `basicReporting` - Standard reports
- `attendance` - Attendance tracking
- `basicNotifications` - Email notifications

**Professional Features:**

- `advancedReporting` - Detailed analytics and custom reports
- `exports` - Export data to CSV/Excel
- `multiLocation` - Manage multiple branches/locations
- `bulkOperations` - Bulk import/export
- `customization` - Custom branding

**Enterprise Features:**

- `sso` - Single Sign-On integration
- `apiAccess` - REST API access
- `webhooks` - Webhook integrations
- `advancedSecurity` - 2FA, IP restrictions
- `dedicatedSupport` - Priority support

Your specific license may have different features. Always check the actual license's `features`
object rather than assuming feature names.

## Feature Validation vs. Tier Checking

Feature gating and tier checking are related but different:

**Tier checking** - Verifies the license is at minimum tier:

```javascript
if (license.tier === 'pro') {
  // User has Pro tier
}
```

**Feature checking** - Verifies a specific feature is enabled:

```javascript
if (license.features.advancedReporting) {
  // User can use advanced reporting
}
```

You can have a Pro license without all Pro features, or have a Standard license with some specific
features enabled. Always check actual features, not just tier.

## Next Steps

- [License Validation](/guide/license-validation) - Validate and get license data
- [Tier-Based Access](/guide/tier-based-access) - Manage license tiers
- [Error Handling](/guide/error-handling) - Handle feature unavailability gracefully
