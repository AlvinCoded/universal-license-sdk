# Device Fingerprinting

## Overview

A device fingerprint is a unique identifier that represents a specific device or installation. The
SDK automatically generates these fingerprints for your platform without requiring manual
configuration.

## What is a Device Fingerprint?

A device fingerprint is a hash created from device characteristics that are unlikely to change
during normal use. This allows licenses to be bound to specific devices, preventing unauthorized
sharing.

For example, a browser fingerprint might be generated from:

- User agent string
- Screen resolution
- Timezone
- Language settings

A server fingerprint might use:

- Hostname
- Operating system version
- Installation path

## Generating Device Fingerprints

### JavaScript/Browser

```javascript
import { DeviceFingerprint } from '@unilic/client';

// Generate device fingerprint for current browser
const deviceId = await DeviceFingerprint.generate();

console.log(deviceId);
// Output: "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
```

The browser fingerprint is deterministic - the same browser in the same state will always generate
the same ID. Clearing browser data (cache, cookies) or significantly changing your environment
(screen resolution, timezone) might result in a different fingerprint.

### Node.js

```javascript
import { DeviceFingerprint } from '@unilic/client';

// Generate device fingerprint for server
const deviceId = DeviceFingerprint.generate();

console.log(deviceId);
// Output: "server-fingerprint-hash-xyz789"
```

Server fingerprints are based on stable server characteristics like hostname and OS information.
They generally remain consistent across server restarts.

### PHP

```php
use UniversalLicense\Validation\DeviceFingerprint;

// Generate platform-agnostic fingerprint
$deviceId = DeviceFingerprint::generate();

echo $deviceId;
// Output: "abc123def456ghi789jkl012mno345pqr"
```

PHP automatically detects the platform (web server, CLI, etc.) and generates an appropriate
fingerprint.

### WordPress

```php
use UniversalLicense\Validation\DeviceFingerprint;

// Generate WordPress-specific fingerprint
$deviceId = DeviceFingerprint::generateForWordPress();

echo $deviceId;
// Output: "wp-specific-fingerprint-hash"
```

WordPress fingerprints use WordPress-specific information like the site URL, WordPress path, and
database details.

### Laravel

```php
use UniversalLicense\Validation\DeviceFingerprint;

// Generate Laravel-specific fingerprint
$deviceId = DeviceFingerprint::generateForLaravel();

echo $deviceId;
// Output: "laravel-specific-fingerprint-hash"
```

Laravel fingerprints use Laravel-specific information like the app path, app name, and database
details.

## Using Device Fingerprints

### Store on First Validation

Save the device fingerprint the first time you validate a license:

```javascript
const deviceId = await DeviceFingerprint.generate();

const result = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: deviceId,
});

if (result.valid) {
  // Save for future use
  localStorage.setItem('deviceId', deviceId);
  localStorage.setItem('licenseKey', result.license.licenseKey);
}
```

### Reuse for Subsequent Validations

Use the same device ID for all future validations on that device:

```javascript
// Get stored device ID
const storedDeviceId = localStorage.getItem('deviceId');
const licenseKey = localStorage.getItem('licenseKey');

// Validate using stored ID
const result = await client.validation.validate({
  licenseKey: licenseKey,
  deviceId: storedDeviceId,
});

if (!result.valid) {
  if (result.reason === 'DEVICE_MISMATCH') {
    console.log('License is bound to a different device');
  }
}
```

If you use a different device ID than what the license is bound to, validation will fail with
`DEVICE_MISMATCH`.

## Device Binding vs. No Binding

Licenses can be issued with or without device binding:

### Without Device Binding

The license works on any device:

```javascript
// License has no device binding - works everywhere
const result = await client.validation.validate({
  licenseKey: 'UNBOUND-LICENSE',
  deviceId: 'any-device-id',
});

// Always succeeds (assuming license is active and not expired)
// Works on multiple devices simultaneously
```

Unbound licenses are convenient for users but offer less security. The same license can be used on
multiple devices or shared.

### With Device Binding

The license only works on the specific device where it was activated:

```javascript
// License was bound to device-123 when it was first activated
const result1 = await client.validation.validate({
  licenseKey: 'BOUND-LICENSE',
  deviceId: 'device-123',
});
// result1.valid === true

// Same license on a different device
const result2 = await client.validation.validate({
  licenseKey: 'BOUND-LICENSE',
  deviceId: 'device-456',
});
// result2.valid === false, result2.reason === 'DEVICE_MISMATCH'
```

Device binding prevents the license from being shared across multiple devices.

## Handling Device Changes

If your device fingerprint changes significantly (hardware upgrade, software reinstall, etc.), the
license may fail validation:

```javascript
try {
  const result = await client.validation.validate({
    licenseKey: licenseKey,
    deviceId: await DeviceFingerprint.generate(),
  });

  if (!result.valid && result.reason === 'DEVICE_MISMATCH') {
    // Device changed - license is bound to different device
    showMessage('Please contact support to rebind your license');
  }
} catch (error) {
  console.error('Validation failed:', error);
}
```

In this case, the user would need to contact support to rebind the license to the new device, or use
an unbound license.

## Device Fingerprint Stability

Device fingerprints remain stable across:

- Application restarts
- Server restarts (server fingerprints)
- Browser updates (usually)
- Operating system updates (usually)

Device fingerprints may change due to:

- Major hardware changes
- Timezone or locale changes
- VPN/Proxy changes (browser)
- Complete OS reinstall
- Clearing browser cache/cookies (browser)

## Privacy Considerations

Device fingerprints are deterministic hashes that don't contain personally identifiable information.
They cannot be reversed to discover device details.

For example, a fingerprint like `abc123def456` doesn't reveal:

- Device model
- Operating system version
- User's location
- Any sensitive information

The fingerprint is simply a stable identifier for that device.

## Web vs. Server Fingerprints

### Browser (JavaScript)

Browser fingerprints can vary between:

- Incognito/Private mode windows
- Different browsers on the same device
- Different browser profiles

Store the device ID in `localStorage` to maintain consistency:

```javascript
const getDeviceId = async () => {
  // Try to get stored ID first
  let deviceId = localStorage.getItem('deviceId');

  if (!deviceId) {
    // Generate new ID if not stored
    deviceId = await DeviceFingerprint.generate();
    localStorage.setItem('deviceId', deviceId);
  }

  return deviceId;
};

// Use stored ID for consistency
const deviceId = await getDeviceId();
```

### Server (PHP, Laravel)

Server fingerprints are automatically stable across requests. No need to store:

```php
// Fingerprint is stable across all requests
$deviceId = DeviceFingerprint::generate();
// Always returns same ID for this server

// But you can still cache for performance
$deviceId = cache('server_device_id', function() {
    return DeviceFingerprint::generate();
});
```

## Advanced: Custom Device Identifiers

For scenarios where automatic fingerprinting isn't suitable, you can use custom device identifiers:

```javascript
// Use your own device ID (must be stable)
const customDeviceId = 'my-company-license-' + userId;

const result = await client.validation.validate({
  licenseKey: licenseKey,
  deviceId: customDeviceId,
});
```

The device ID is simply a string that must be consistent for the same device. You can use:

- Installation IDs
- Machine UUIDs
- Custom application identifiers
- Any stable identifier for your system

## Next Steps

- [License Validation](/guide/license-validation) - Use device IDs in validation
- [Tier-Based Access](/guide/tier-based-access) - Manage license tiers
- [Feature Gating](/guide/feature-gating) - Control features
