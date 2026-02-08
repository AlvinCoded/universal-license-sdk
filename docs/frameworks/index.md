# Frameworks Overview

This section provides integration guides for the Universal License SDK across popular JavaScript
frameworks and environments.

## Supported Environments

### JavaScript/TypeScript

**Core runtime support** — works in any JavaScript environment:

- **Browser** — modern browsers with ES6 support
- **Node.js** — server-side services and CLI tools
- **Electron** — desktop applications
- **React Native** — cross-platform mobile
- **Deno** — alternative runtime
- **Bun** — fast JavaScript runtime

### Frontend Frameworks

We provide optimized integrations for popular frontend frameworks:

#### [React](./react.md)

- **Provider & Context** — configure license context globally
- **Hooks** — `useLicense()`, `useLicenseValidation()`, `useFeature()`
- **Components** — `<LicenseGuard>`, `<FeatureGate>`, `<LicenseProvider>`
- **Best for** — SPA applications, modern React patterns

#### [Next.js](./nextjs.md)

- **SSR & SSG** — server-side rendering support
- **API Routes** — server-side license validation
- **Middleware** — request-level authentication
- **Best for** — Full-stack applications, hybrid rendering

#### [Vue 3](./vue.md)

- **Composables** — `useLicense()`, `useValidation()`
- **Components** — utility components and integration patterns
- **Best for** — Vue applications and universal rendering

#### [Vanilla JavaScript](./vanilla-js.md)

- **Direct API** — use the core client directly
- **No framework overhead** — minimal abstraction
- **Best for** — Static sites, progressive enhancement, any JS environment

## Choosing a Framework

### If you're building a **React application**

→ Use the [React Integration](./react.md) for hooks, context, and components

### If you're building a **Next.js full-stack app**

→ Use the [Next.js Integration](./nextjs.md) for SSR, API routes, and middleware

### If you're building a **Vue 3 app**

→ Use the [Vue Integration](./vue.md) for composables and components

### If you're using **vanilla JavaScript** or any other environment

→ Use the [Vanilla JavaScript guide](./vanilla-js.md) with the core client

### If you're building a **server-side service** (Node.js, Deno, etc.)

→ Use the core `@universal-license/client` package directly (see
[JavaScript/TypeScript Installation](/installation/javascript))

### If you're building in **PHP or Laravel**

→ See [PHP Installation](/installation/php) or [Laravel Installation](/installation/laravel)

## Common Patterns Across Frameworks

### 1. Initialize the Client

```javascript
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: process.env.REACT_APP_LICENSE_SERVER_URL,
  cache: true,
});
```

### 2. Validate on App Load

```javascript
useEffect(async () => {
  const result = await client.validate({
    licenseKey: stored_key,
    deviceId: await DeviceFingerprint.generate(),
  });

  if (!result.valid) redirectToOnboarding();
}, []);
```

### 3. Gate Features

```javascript
if (license.features.advancedReporting) {
  showReportingUI();
} else {
  showUpgradePrompt();
}
```

### 4. Handle Renewal

```javascript
if (isExpired(license.expiresAt)) {
  showRenewalCTA();
}
```

## Performance Considerations

All frameworks benefit from:

- **Caching** — automatic validation result caching
- **Device fingerprinting** — one-time computation on app startup
- **Offline support** — cache-first validation for resilience
- **Request deduplication** — only fetch what's needed

## Error Handling

Every framework should implement these error scenarios:

| Scenario        | Handling                                           |
| --------------- | -------------------------------------------------- |
| Network offline | Use cached validation; show notification           |
| License invalid | Redirect to onboarding/renewal                     |
| License expired | Show grace period or renewal UI                    |
| Device mismatch | Show error or re-activate                          |
| API error       | Retry with exponential backoff; fall back to cache |

## See Also

- [Installation](/installation) — Platform-specific setup
- [API Reference](/api/client) — Core client methods
- [Examples](/examples/) — Real-world patterns
- [Configuration](/config/sdk-config) — SDK options
