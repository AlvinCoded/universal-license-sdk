# API Reference (Overview)

This page is an entry point to the SDK API documentation.

- Start here: `/api/`
- Main class: `/api/client`

The SDK is designed to talk to a license server that implements the “Universal License API” routes
described throughout `/api/*`.

## Common headers & behaviors

Some deployments enable additional protections and compatibility features. Keep these in mind when
integrating:

- Public endpoints may require `X-ULS-App-Key: <your-app-key>`.
- Write-like endpoints may support idempotency via `Idempotency-Key: <unique value>`.
- If signing key rotation is enabled, validation responses may include `signatureKid` and the
  public-keys endpoint may return a keyset (multiple keys).
- Anti-abuse controls may apply to purchase/payment routes:
  - `429` when rate limit or daily quota is exceeded
  - `403` when CAPTCHA is required/failed (token is typically sent as `x-uls-captcha-token` or
    `captchaToken` in the request body)

For details and examples, see `/best-practices`.

If you are migrating from direct HTTP calls, see `/migration/from-direct-api`.
