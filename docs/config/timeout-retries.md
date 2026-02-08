# Timeout & Retries

## Overview

Network requests can fail for temporary reasons (connection drops, server overload, etc.). The SDK
automatically handles these situations with intelligent retry logic and configurable timeouts.

## Timeout Configuration

A timeout occurs when the server doesn't respond within a specified time limit. By default, the SDK
waits 30 seconds before timing out.

### Setting Timeout

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  timeout: 30000, // 30 seconds (in milliseconds)
});
```

The timeout value should account for:

- Network latency (distance to server)
- Server processing time
- Database query complexity

### Timeout for Different Scenarios

```javascript
// Fast, local development
const devClient = new LicenseClient({
  baseUrl: 'http://localhost:3001/api',
  timeout: 10000, // 10 seconds - fail fast for quick feedback
});

// Production with reliable network
const prodClient = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  timeout: 30000, // 30 seconds - default
});

// Slow network (satellite, mobile 3G, distant server)
const slowNetworkClient = new LicenseClient({
  baseUrl: 'https://far-away-server.com/api',
  timeout: 60000, // 60 seconds - allow more time
});
```

### PHP Timeout

```php
// PHP timeout is in seconds (not milliseconds!)
$client = new LicenseClient([
    'baseUrl' => 'https://your-server.com/api',
    'timeout' => 30  // 30 seconds
]);
```

## Retry Configuration

When a request fails due to network issues or server errors, the SDK can automatically retry. By
default, it retries 3 times.

### Setting Retries

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  retries: 3, // Retry up to 3 times
});
```

The SDK only retries certain types of errors:

- **Network errors** (connection refused, timeout, no internet)
- **Server errors** (5xx status codes)

It does NOT retry:

- **Client errors** (4xx status codes) - these indicate problems with your request
- **Authentication errors** (401, 403) - retrying won't help
- **Not found errors** (404) - the resource doesn't exist

### Retry Backoff

The SDK uses exponential backoff between retries. This means it waits progressively longer between
each retry:

```
Attempt 1 → Fails
Wait 1 second
Attempt 2 → Fails
Wait 2 seconds
Attempt 3 → Fails
Wait 4 seconds
Attempt 4 → Fails
Error thrown
```

Without backoff, rapid retries could overwhelm a struggling server. With backoff, you give the
server time to recover.

### Configuring Retry Strategy

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  retries: 5, // Retry more times for unreliable networks
});

// Or disable retries
const noRetryClient = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  retries: 0, // No retries - fail immediately
});
```

For production, use at least 3 retries to handle temporary blips. For critical operations, you might
use 5 retries.

## Handling Timeout and Retry Errors

```javascript
import { LicenseError, NetworkError, ValidationError } from '@unilic/client';

try {
  const result = await client.validation.validate({
    licenseKey: 'KEY',
    deviceId: 'device-123',
  });
} catch (error) {
  if (error instanceof NetworkError) {
    // Network error after all retries exhausted
    console.error('Network error (retries exhausted):', error.message);

    // Show offline mode or retry manually
    showOfflineMode();
  } else if (error instanceof ValidationError) {
    // Validation/auth type errors (401/403, etc.)
    console.error('Validation error:', error.code, error.message);
  } else if (error instanceof LicenseError) {
    // Other API errors (4xx) surfaced as LicenseError
    // Tip: inspect error.code (e.g. INVALID_LICENSE)
    console.error('License error:', error.code, error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### PHP Error Handling

```php
use UniversalLicense\Exceptions\ApiException;
use UniversalLicense\Exceptions\ValidationException;
use UniversalLicense\Exceptions\LicenseException;

try {
    $result = $client->validation->validate([
        'licenseKey' => 'KEY',
        'deviceId' => 'device-123'
    ]);
} catch (ValidationException $e) {
    // Invalid input / validation constraints
    error_log('Validation error: ' . $e->getMessage());
} catch (ApiException $e) {
    // Network/server/client API errors
    error_log('API error: ' . $e->getMessage());

    // Network/timeout errors use statusCode=0
    if ($e->getStatusCode() === 0) {
        // Serve cached response or show offline mode
    }

    if ($e->getStatusCode() === 404) {
        // License not found
    }
} catch (LicenseException $e) {
    // Any SDK error
    error_log('SDK error: ' . $e->getMessage());
} catch (Exception $e) {
    error_log('Unexpected error: ' . $e->getMessage());
}
```

## Manual Retry Logic

If you need more control, handle retries manually:

```javascript
async function validateWithCustomRetry(licenseKey, maxRetries = 5, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await client.validation.validate({
        licenseKey,
        deviceId: 'device-123',
      });

      return result;
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Usage
const result = await validateWithCustomRetry('KEY', 5);
```

In this example, if a request fails, it waits for progressively longer periods before retrying. The
base delay of 1000ms doubles with each attempt (1s, 2s, 4s, 8s, 16s).

## Production Recommendations

### For API Endpoints

```javascript
// User-facing endpoints need fast failures
const fastClient = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  timeout: 10000, // Fail quickly to show error UI
  retries: 2, // Minimal retries
});
```

### For Background Operations

```javascript
// Background jobs can afford to wait longer
const resilientClient = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  timeout: 60000, // More time for processing
  retries: 5, // More retries for reliability
});
```

### For Critical Operations

```javascript
// License generation/revocation should succeed
const criticalClient = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  timeout: 45000, // Reasonable timeout
  retries: 5, // Many retries
  cache: false, // Always fresh
});
```

## Monitoring Retries

In debug mode, you can see retry behavior:

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  retries: 3,
  debug: true, // Logs each retry attempt
});

// Output:
// [License SDK] Attempt 1 of 3: POST /api/licenses/validate
// [License SDK] Error: Network timeout, retrying...
// [License SDK] Waiting 1000ms before retry
// [License SDK] Attempt 2 of 3: POST /api/licenses/validate
// [License SDK] Success: 200 OK
```

## Common Timeout Issues

### Server Takes Too Long

If your server is slow (database queries, external API calls), increase timeout:

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  timeout: 60000, // Give server 60 seconds
});
```

### Network Latency

If your users have high-latency networks, increase timeout:

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  timeout: 45000, // Account for network delay
});
```

### Intermittent Failures

If failures are intermittent (server crashes, network blips), increase retries:

```javascript
const client = new LicenseClient({
  baseUrl: 'https://your-server.com/api',
  retries: 5, // More chances to succeed
});
```

## Per-Request Configuration

Override timeout and retries for specific requests:

```javascript
// Standard request uses default timeout/retries
await client.validation.validate({ licenseKey: 'KEY' });

// This request needs more time
await client.validation.validate({ licenseKey: 'KEY' }, { timeout: 60000, retries: 5 });

// This is time-critical, fail fast
await client.validation.validate({ licenseKey: 'KEY' }, { timeout: 5000, retries: 1 });
```

## Next Steps

- [Cache Settings](/config/cache) - Leverage caching for resilience
- [Debug Mode](/config/debug) - Monitor request behavior
- [Core Guides - Error Handling](/guide/error-handling) - Comprehensive error strategies
