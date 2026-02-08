# Best Practices

These practices help you build a licensing integration that is reliable, secure, and user-friendly.

## 1) Treat `baseUrl` as a deployment setting

- Put it in an environment variable.
- Include the `/api` prefix so the SDK can resolve routes correctly.
- Use different values for local/dev/staging/prod.

Example:

```ts
const client = new LicenseClient({
  baseUrl: import.meta.env.VITE_LICENSE_API_BASE_URL,
});
```

## 2) Separate “public app” vs “admin” usage

Use two mental models:

- **Public app flow (no auth):** validate a license key, unlock features, perform purchases.
- **Admin flow (JWT auth):** manage products/plans/licenses, view dashboards, exports/imports.

In production, your end-user applications typically should not have admin tokens.

## 3) Validate once, then use cached feature gates

The validation endpoint is the best source of truth for feature access.

Recommended approach:

1. On startup/onboarding, call `client.validation.validate(...)`.
2. Store _only_ what you need for UX (tier/features/expiry), not sensitive admin tokens.
3. Gate your UI from the stored validation result.
4. Re-validate on a schedule (e.g., at app start + once every N hours) and when you detect the app
   is online again.

This reduces server load and makes the UI resilient to transient failures.

## 4) Make device fingerprints stable and explainable

Device binding prevents a single license key from being used across multiple machines.

Practical guidance:

- Prefer a stable fingerprint in browsers (the SDK’s `DeviceFingerprint.generate()` is a good
  default).
- Persist the `deviceId` so you don’t generate a “new device” every page load.
- If you regenerate the device ID, expect `DEVICE_MISMATCH` for licenses that are already bound.

## 5) Handle validation reasons explicitly

Don’t just show “Invalid license”. The `reason` field makes your UX much better.

Typical mapping:

- `INVALID_KEY`: typo or wrong key
- `EXPIRED`: show renewal CTA
- `REVOKED` / `SUSPENDED`: show support/help text
- `DEVICE_MISMATCH`: show “transfer license” or “contact admin” flow
- `INSUFFICIENT_TIER`: show upgrade CTA
- `MISSING_FEATURES`: show upgrade CTA and list missing features

See `/guide/license-validation` and `/guide/error-handling`.

## 6) Prefer shorter timeouts + retries for UX

For user-facing apps, long hangs feel worse than a clean failure.

- Use a 10–15s timeout for interactive screens.
- Keep retries low (1–2) for user-facing requests.
- Consider a higher retry count for background refresh jobs.

## 7) Use cache intentionally

Caching is helpful, but you should decide what “offline-friendly” means for your product.

- Short TTL (minutes): strict enforcement, minimal offline usage.
- Medium TTL (hours): smoother UX with occasional outages.
- Long TTL (days): “offline-first”, but increases risk if a license is revoked.

If you need strong offline enforcement, add signature verification (see
`/guide/offline-validation`).

## 8) Keep secrets off the client

- Never ship private keys to browsers.
- Don’t embed admin JWTs in public apps.
- If you must perform admin actions, do it from a trusted server you control.

## 9) Log enough to debug, but not sensitive data

Use `debug: true` during development. In production:

- Log request IDs, endpoints, status codes.
- Avoid logging full license keys if that’s sensitive for your app.
- Avoid logging JWTs.

## 10) Use `X-ULS-App-Key` for public endpoints

All **public** endpoints require an Application API key.

- Send `X-ULS-App-Key: <your-app-key>` on requests like:
  - `POST /api/licenses/validate`
  - `GET /api/licenses/keys/public`
  - purchase/payment flows under `/api/purchases/*` and `/api/payment/*`

The JS and PHP SDKs can set this automatically via `appKey`.

## 11) Add idempotency keys to purchase/payment calls

For retry safety (double-submits, flaky networks), send an idempotency key:

- Header: `Idempotency-Key: <unique value>` (UUID recommended)

The server will replay the original response for retries and return `409` if the same key is reused
with different request data.

## 12) Support signing key rotation (kid + keysets)

The public key endpoint is backwards compatible:

- Legacy: `{ publicKey }`
- Rotation-aware: `{ publicKey, kid, keys: [{ kid, publicKey, status, createdAt }] }`

Validation responses may include:

- `signatureKid`: the key ID that produced `signature`

Rotation-aware clients should prefer verifying signatures using `signatureKid` against the returned
keyset.

## 13) Handle anti-abuse responses (rate limits / quotas / CAPTCHA)

Public purchase/payment endpoints may be protected by:

- Per-app + IP rate limiting
- Daily per-app quotas
- Optional CAPTCHA enforcement

If you hit these controls, expect:

- `429` (Too Many Requests): rate limit or quota exceeded
- `403` (Forbidden): CAPTCHA required/failed

If CAPTCHA is enabled server-side, include a token either:

- As a header (default): `x-uls-captcha-token: <token>`
- Or in the JSON body as `captchaToken`

The header name can be changed by the server via `CAPTCHA_TOKEN_HEADER`.
