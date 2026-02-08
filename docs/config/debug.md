# Debug Mode

## Overview

Debug mode provides detailed logging of SDK operations, helping you troubleshoot integration issues
and understand request/response flows.

## Enabling Debug Mode

### JavaScript/TypeScript

```javascript
import { LicenseClient } from '@unilic/client';

const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  debug: true, // Enable detailed logging
});

// Output will show all requests, responses, and errors
```

### React

```jsx
import { LicenseProvider } from '@unilic/react';

function App() {
  return (
    <LicenseProvider
      config={{
        baseUrl: 'https://your-server.com/api',
        debug: true,
      }}
    >
      <YourApp />
    </LicenseProvider>
  );
}
```

### PHP

```php
$client = new LicenseClient([
    'baseUrl' => 'https://your-server.com/api',
    'debug' => true
]);

// Logs go to error_log() or specified logger
```

### Laravel

```php
// .env
LICENSE_DEBUG=true

// config/license.php
return [
    'base_url' => env('LICENSE_SERVER_URL'),
    'debug' => env('LICENSE_DEBUG', false),
];
```

## What Gets Logged

Debug mode logs:

- **Requests** - Method, URL, headers, body
- **Responses** - Status code, headers, body
- **Timing** - How long each request took
- **Retries** - When and why retries happen
- **Cache** - Cache hits, misses, and invalidations
- **Errors** - Full error details with stack traces

## Example Debug Output

```
[License SDK] POST /api/licenses/validate
[License SDK] Request headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer token..."
}
[License SDK] Request body: {
    "licenseKey": "PROD-ORG-2025-XXXX-XXXX-XXXX",
  "deviceId": "abc123def456..."
}

[License SDK] Response: 200 OK (145ms)
[License SDK] Cache set: licenses:PROD-ORG-2025-XXXX-XXXX-XXXX

[License SDK] Response body: {
  "valid": true,
  "license": {
        "licenseKey": "PROD-ORG-2025-XXXX-XXXX-XXXX",
    "tier": "pro",
    "status": "active"
  }
}
```

## Debugging Common Issues

### License Validation Fails

Enable debug to see why validation fails:

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  debug: true,
});

const result = await client.validation.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: 'device-123',
});

// Debug output shows:
// - Exact request sent to server
// - Server's response (why it failed)
// - Any validation errors
```

### Timeout Issues

See how long requests actually take:

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  timeout: 10000,
  debug: true,
});

// Output shows:
// [License SDK] POST /api/licenses/validate
// [License SDK] Response: 200 OK (8932ms)
//
// If timing is close to timeout, increase it!
```

### Cache Not Working

Debug shows cache operations:

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  cache: true,
  debug: true,
});

// First call - cache miss
const result1 = await client.validation.validate({ licenseKey: 'KEY' });
// [License SDK] Cache miss for licenses:KEY
// [License SDK] POST /api/licenses/validate
// [License SDK] Cache set: licenses:KEY

// Second call - cache hit
const result2 = await client.validation.validate({ licenseKey: 'KEY' });
// [License SDK] Cache hit: licenses:KEY (returned in 2ms)
```

### Retry Behavior

See when and why retries happen:

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  retries: 3,
  debug: true,
});

// If server fails:
// [License SDK] Attempt 1 of 3: POST /api/licenses/validate
// [License SDK] Error: Connection timeout
// [License SDK] Waiting 1000ms before retry...
// [License SDK] Attempt 2 of 3: POST /api/licenses/validate
// [License SDK] Response: 200 OK
```

## Environment-Specific Debug

### Development: Enable Debug

```javascript
const client = new LicenseClient({
  baseUrl: 'http://localhost:3001/api',
  debug: import.meta.env.DEV, // True in development
});
```

### Production: Disable Debug

Never enable debug in production as it logs sensitive data:

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  debug: false, // Always false in production
});
```

Debug logs contain:

- License keys (sensitive!)
- Device IDs
- Authorization tokens
- API responses with user data

## Custom Logging

If you need more control over logging, implement a custom logger:

```javascript
class CustomLogger {
  log(level, message, data) {
    if (level === 'error') {
      console.error(`[License SDK] ${message}`, data);
      // Send to error tracking service
      Sentry.captureException(new Error(message));
    } else if (level === 'info') {
      console.log(`[License SDK] ${message}`, data);
    }
  }
}

const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  logger: new CustomLogger(),
});
```

## Filtering Sensitive Data

When using debug mode, be careful with sensitive information:

```javascript
// Don't log full license keys in production
const debugLog = (message, data) => {
  if (process.env.NODE_ENV === 'production') {
    // Mask sensitive data
    if (data.licenseKey) {
      data.licenseKey = data.licenseKey.substring(0, 8) + '...';
    }
  }
  console.log(message, data);
};
```

## Browser DevTools

When using the SDK in the browser, you can also inspect network traffic:

1. Open DevTools (F12)
2. Go to Network tab
3. Filter for `api` requests
4. Click any request to see:
   - Request headers and body
   - Response status and body
   - Timing information

This is useful alongside SDK debug logging to cross-reference.

## Performance Monitoring

Debug mode helps identify performance bottlenecks:

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  debug: true,
});

// Monitor response times
const start = Date.now();
const result = await client.validation.validate({ licenseKey: 'KEY' });
const duration = Date.now() - start;

console.log(`License validation took ${duration}ms`);

// If consistently slow, increase timeout or investigate server
```

## Disabling Debug in Different Contexts

### Only Enable for Errors

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  debug: process.env.LICENSE_SDK_DEBUG === 'true',
});

// Enable only when needed:
// LICENSE_SDK_DEBUG=true npm run dev
```

### Conditional Debug per Module

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  debug: false, // Global debug off

  // But enable specific modules:
  // debugModules: ['validation', 'cache']
});
```

## Next Steps

- [Troubleshooting](/troubleshooting) - Use debug to diagnose issues
- [SDK Configuration](/config/sdk-config) - Review all config options
- [Error Handling](/guide/error-handling) - Understand error types
