# FAQ

## Does this SDK require a specific server?

The SDK targets a specific REST API shape (routes + JSON response formats). If your server
implements that API contract, you can use the SDK.

## Where do I put `/api`?

Include `/api` in `baseUrl`:

```ts
new LicenseClient({ baseUrl: 'https://license.example.com/api' });
```

## Do I need an API key?

- For end-user validation, purchases, and renewals: typically **no**.
- For admin operations (stats, license management, product/plan creation, imports/exports): **yes**
  (JWT).

## What is a `deviceId` and do I have to use it?

`deviceId` is a device fingerprint used for device binding.

- If your server enforces device binding, you must provide a stable `deviceId`.
- If you don’t want device binding, configure your server accordingly.

See `/guide/device-fingerprinting`.

## Why do I get `DEVICE_MISMATCH`?

That license key is already bound to a different device.

Fix: persist a stable `deviceId`, or implement a “transfer device” flow server-side.

## Can I validate offline?

You can do cache-first validation (use cached results when offline). For strong offline enforcement
(tamper resistance), use signature verification.

See `/guide/offline-validation`.

## What are the possible validation `reason` codes?

Common values:

- `INVALID_KEY`
- `REVOKED`
- `SUSPENDED`
- `EXPIRED`
- `DEVICE_MISMATCH`
- `INSUFFICIENT_TIER`
- `MISSING_FEATURES`

See `/api/validation`.

## How do I show upgrade prompts for tier/features?

Pass `requiredTier` and/or `requiredFeatures` when validating.

If validation fails, the response includes `currentTier`, `requiredTier`, and/or `missingFeatures`.

See `/guide/feature-gating` and `/guide/tier-based-access`.

## Is caching on by default?

Yes. You can disable it with `cache: false`.

See `/config/cache`.

## How do I clear cached results?

```ts
client.clearCache();
```

## Can I use the SDK on the server (Node.js)?

Yes. The SDK supports Node.js.

- If you’re running in SSR, be mindful about browser-only APIs.
- If you don’t need caching in SSR, pass `cache: false`.

## Does the React package replace the client package?

No. `@unilic/react` is a thin wrapper around `@unilic/client`.

## How do I authenticate admin calls?

Login via `client.auth.login(...)` (or your own auth flow), then:

```ts
client.setToken(token);
```

## Where are the TypeScript types?

Types are exported from `@unilic/core` and re-exported by `@unilic/client`.

See `/api/types`.

## Can I use this in PHP?

Yes, a PHP package exists under the same SDK project.

See `/installation/php`.
