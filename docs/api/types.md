# Types

The SDK is TypeScript-first.

Most shared types live in `@unilic/core` and are re-exported by `@unilic/client` for convenience.

## Where to import from

Recommended:

```ts
import type {
  SDKConfig,
  ValidateLicenseRequest,
  ValidateLicenseResponse,
  Product,
  SubscriptionPlan,
} from '@unilic/client';
```

If you only need pure types/utilities (and not the HTTP client), import from core:

```ts
import type { License, LicenseTier } from '@unilic/core';
```

## Key types you will use often

### Configuration

- `SDKConfig`

### Validation

- `ValidateLicenseRequest`
- `ValidateLicenseResponse`
- `LicenseTier`

### Products / Plans

- `Product`
- `SubscriptionPlan`

### Purchases

- `CreateOrderRequest`
- `CreateOrderResponse`
- `CompletePurchaseRequest`
- `CompletePurchaseResponse`
- `PurchaseOrder`

## Naming conventions

You will see two “shapes” of license data:

1. **Validated license** returned from `POST /licenses/validate` (camelCase fields like
   `expiresAt`).
2. **Admin license entity** returned from admin endpoints (snake_case fields like `expires_at`).

Both are intentional and mirror what the server returns.
