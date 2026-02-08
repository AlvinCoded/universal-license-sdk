# Troubleshooting

This page covers the most common issues when integrating the SDK.

## Base URL issues

### Symptom: every request 404s

Most often, `baseUrl` is missing the `/api` prefix.

Correct:

```ts
new LicenseClient({ baseUrl: 'https://license.example.com/api' });
```

Incorrect:

```ts
new LicenseClient({ baseUrl: 'https://license.example.com' });
```

### Symptom: CORS errors in the browser

The SDK can’t bypass CORS; your server must allow the origin.

Checklist:

- Allow your frontend domain in `Access-Control-Allow-Origin`
- Allow `Authorization` header if you use admin endpoints
- Allow `Content-Type: application/json`

## Validation failures

### Symptom: `{ valid: false, reason: 'INVALID_KEY' }`

- The key is wrong (typo/paste issue) or does not exist.
- Confirm you are validating against the correct environment.

### Symptom: `{ valid: false, reason: 'DEVICE_MISMATCH' }`

- The license is already bound to a different device.
- Ensure your `deviceId` is stable and persisted.
- If you want “device transfers”, implement a server-side transfer flow.

### Symptom: `{ valid: false, reason: 'INSUFFICIENT_TIER' }`

- You passed `requiredTier` and the license tier is lower.
- Use the `currentTier` / `requiredTier` fields to show an upgrade path.

### Symptom: `{ valid: false, reason: 'MISSING_FEATURES' }`

- You passed `requiredFeatures` and one or more are not enabled.
- Use `missingFeatures` to render a helpful message.

## Admin endpoint failures

### Symptom: 401 Unauthorized

- You called an admin endpoint without a JWT.

Fix:

```ts
client.setToken(token);
// or new LicenseClient({ baseUrl, apiKey: token })
```

### Symptom: 403 Forbidden

- Your token is valid but doesn’t have admin permissions.
- Confirm your server roles/claims and which endpoints require admin.

## SSR / Next.js issues

### Symptom: `window is not defined`

If you instantiate the client in a server-only context, browser-only storage won’t exist.

Fix options:

- Create the client inside a client component.
- Or create it in SSR with `cache: false` (so it doesn’t try to use browser storage).

```ts
const client = new LicenseClient({ baseUrl, cache: false });
```

## Cache surprises

### Symptom: license looks “stuck” after renewal/revoke

The SDK caches successful validations/licenses when cache is enabled.

Fix:

- Call `client.clearCache()` after actions that change server state.
- Or reduce TTL via configuration.

## Network errors

### Symptom: intermittent failures on mobile/poor networks

Recommendations:

- Lower timeout (user-facing) and show a retry button.
- Use retries for background refresh.
- Use cache-first behavior to keep the app usable.
