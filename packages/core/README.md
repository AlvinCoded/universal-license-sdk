# @universal-license/core

Core types, utilities, and constants for Universal License SDK.

## Installation

```bash
npm install @universal-license/core
# or
pnpm add @universal-license/core
# or
yarn add @universal-license/core
```

## Usage

### Import Types

```typescript
import type { License, ValidateLicenseRequest, SubscriptionPlan } from '@universal-license/core';

const license: License = {
  id: 1,
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  // ...
};
```

### Use Utilities

```typescript
import { DeviceFingerprint, isValidLicenseKey, daysUntilExpiry } from '@universal-license/core';

// Generate device fingerprint
const deviceId = await DeviceFingerprint.generate();

// Validate license key format
if (isValidLicenseKey('PROD-ORG-2025-XXXX-XXXX-XXXX')) {
  console.log('Valid license key format');
}

// Calculate days until license expires
const days = daysUntilExpiry('2025-12-31T23:59:59Z');
console.log(`License expires in ${days} days`);
```

### Use Constants

```typescript
import { LICENSE_TIERS, LICENSE_STATUS, ERROR_CODES } from '@universal-license/core';

// Check tier hierarchy
if (LICENSE_TIER_HIERARCHY[userTier] >= LICENSE_TIER_HIERARCHY['pro']) {
  // User has pro or higher
}

// Use error codes
throw new Error(ERROR_CODES.LICENSE_EXPIRED);
```

## Included Utilities

### Device Fingerprinting

- `DeviceFingerprint.generate()` - Generate unique device ID
- `DeviceFingerprint.isValidDeviceId()` - Validate device ID format

> Note: The SDK surfaces two shapes for license objects. The validation response
> `ValidateLicenseResponse.license` uses camelCase (e.g., `expiresAt`, `licenseKey`, `maxUsers`),
> while low-level `License` entities returned by admin APIs use snake_case (e.g., `expires_at`,
> `license_key`). Be mindful when moving objects between layers; prefer SDK helpers where possible.

### Validators

- `isValidEmail()` - Email validation
- `isValidLicenseKey()` - License key format
- `isValidProductCode()` - Product code format
- `isLicenseExpired()` - Check if license is expired
- `daysUntilExpiry()` - Calculate days until expiry
- And 15+ more validators

### Crypto

- `sha256()` - Hash strings
- `generateUUID()` - Generate UUIDs
- `verifySignature()` - Verify RSA signatures
- `base64Encode/Decode()` - Base64 operations

## Type Exports

All types from:

- `common.types.ts` - API responses, pagination
- `license.types.ts` - License entities
- `purchase.types.ts` - Purchase orders
- `product.types.ts` - Products and plans
- `validation.types.ts` - Validation results
- `renewal.types.ts` - Renewal operations

## Constants

- `LICENSE_TIERS` - Available license tiers
- `LICENSE_STATUS` - License statuses
- `PAYMENT_STATUS` - Payment statuses
- `API_ENDPOINTS` - API endpoint paths
- `ERROR_CODES` - Standard error codes
- `VALIDATION_PATTERNS` - Regex patterns
- And more...

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
