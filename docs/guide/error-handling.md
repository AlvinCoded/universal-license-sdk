# Error Handling

## Overview

The SDK provides comprehensive error handling to help you manage different failure scenarios
gracefully. Understanding error types and recovery strategies is crucial for building reliable
applications.

## Error Types

The SDK exports several error classes that help you identify and respond to different situations:

### ValidationError

Thrown when validation fails (license invalid, expired, revoked, etc.):

```javascript
import { ValidationError } from '@universal-license/client';

try {
  const result = await client.validate({
    licenseKey: 'INVALID-KEY',
    deviceId: 'device-123',
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
    // Handle invalid license
  }
}
```

This is thrown when the license itself fails validation checks - the request was successful but the
license is not valid for some reason.

### NetworkError

Thrown when network communication fails:

```javascript
import { NetworkError } from '@universal-license/client';

try {
  const result = await client.validate({
    licenseKey: 'KEY',
    deviceId: 'device-123',
  });
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network unreachable:', error.message);
    // Retry or show offline mode
  }
}
```

Network errors include connection failures, timeouts, and DNS issues. The SDK automatically retries
these based on your configuration.

### PurchaseError

Thrown when purchase operations fail:

```javascript
import { PurchaseError } from '@universal-license/client';

try {
  const order = await client.purchases.createOrder({
    planCode: 'PRO-PLAN',
    organizationData: {
      /* ... */
    },
  });
} catch (error) {
  if (error instanceof PurchaseError) {
    console.error('Purchase failed:', error.message);
    // Handle purchase failure
  }
}
```

Purchase errors occur when order creation, completion, or retrieval fails.

### LicenseError

Thrown for general license operation failures:

```javascript
import { LicenseError } from '@universal-license/client';

try {
  // Admin endpoint example (e.g. fetching a license by key)
  const license = await client.licenses.get('KEY');
} catch (error) {
  if (error instanceof LicenseError) {
    console.error('License operation failed:', error.message);
    // Handle license operation failure
  }
}
```

## Comprehensive Error Handling

Here's a pattern for handling all error types:

```javascript
import {
  ValidationError,
  NetworkError,
  PurchaseError,
  LicenseError,
} from '@universal-license/client';

async function handleLicenseOperation(operation) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ValidationError) {
      // Typically indicates auth/permission failures (401/403)
      console.error('Unauthorized or forbidden');
      showReLoginUI();
    } else if (error instanceof NetworkError) {
      // No internet connection or server unreachable
      console.error('Network error');
      showOfflineMode();
    } else if (error instanceof PurchaseError) {
      // Purchase-related error
      console.error('Purchase failed');
      showPurchaseErrorDialog(error.message);
    } else if (error instanceof LicenseError) {
      // General license operation error
      console.error('License operation failed');
      showErrorNotification(error.message);
    } else {
      // Unknown error
      console.error('Unexpected error:', error);
      showGenericErrorDialog();
    }
  }
}

// Usage
await handleLicenseOperation(() => client.validate({ licenseKey: 'KEY', deviceId: 'device-123' }));
```

## HTTP Status Codes

When making API requests, the SDK translates HTTP status codes into appropriate errors:

```javascript
// 4xx Client Errors - Not retried
// 400 Bad Request - Invalid input
// 401 Unauthorized - Invalid authentication
// 403 Forbidden - Access denied
// 404 Not Found - Resource doesn't exist

// 5xx Server Errors - Automatically retried
// 500 Internal Server Error
// 502 Bad Gateway
// 503 Service Unavailable
// 504 Gateway Timeout

try {
  // Example: 404 from an admin endpoint will throw a LicenseError
  await client.licenses.get('NONEXISTENT-KEY');
} catch (error) {
  if (error instanceof LicenseError) {
    // HTTP 404 - Resource not found
    console.error('License does not exist');
  }
}
```

## Recovery Strategies

### Retry on Network Errors

The SDK automatically retries network errors. You can configure retry behavior:

```javascript
const client = new LicenseClient({
  baseUrl: 'https://license.yourdomain.com/api',
  retries: 5, // Retry up to 5 times
  timeout: 30000, // 30 second timeout
});

// SDK will automatically retry network failures with exponential backoff
const result = await client.validate({
  licenseKey: 'KEY',
  deviceId: 'device-123',
});
```

### Fallback to Cache

When network fails, use cached validation results:

```javascript
async function validateWithFallback(licenseKey, deviceId) {
  try {
    // Force a fresh validation by temporarily disabling caching
    client.setConfig({ cache: false });
    const fresh = await client.validate({ licenseKey, deviceId });
    return fresh;
  } catch (error) {
    if (error instanceof NetworkError) {
      // Network failed - try cached result
      try {
        client.setConfig({ cache: true });
        return await client.validate({ licenseKey, deviceId });
      } catch (cacheError) {
        // No cache available
        throw new Error('Offline and no cached license data');
      }
    }
    throw error;
  } finally {
    // Restore default caching behavior (optional)
    client.setConfig({ cache: true });
  }
}
```

### Graceful Degradation

Show reduced functionality when license validation fails temporarily:

```javascript
async function initializeApp() {
  try {
    const license = await client.validate({
      licenseKey: localStorage.getItem('licenseKey'),
      deviceId: await DeviceFingerprint.generate(),
    });

    if (license.valid) {
      enableFullFeatures(license);
    } else {
      showLicenseExpiredPrompt();
    }
  } catch (error) {
    if (error instanceof NetworkError) {
      // No internet - enable cached features if available
      const cachedLicense = getCachedLicense();
      if (cachedLicense) {
        enableFullFeatures(cachedLicense);
        showOfflineNotice('Running offline - some features may be limited');
      } else {
        showOfflineError('No cached license data - please connect to internet');
      }
    } else {
      showErrorPrompt(error);
    }
  }
}
```

### Retry with Exponential Backoff

Implement custom retry logic for critical operations:

```javascript
async function retryWithBackoff(operation, maxRetries = 5, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry client errors (4xx)
      if (error instanceof ValidationError) {
        throw error;
      }

      // Network errors can be retried
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Usage for critical operations
const license = await retryWithBackoff(
  () =>
    client.validate({
      licenseKey: 'KEY',
      deviceId: 'device-123',
    }),
  5, // Max 5 retries
  1000 // Start with 1 second delay
);
```

## React Error Boundaries

In React, wrap license operations in error boundaries:

```jsx
import { useState } from 'react';
import { ValidationError, NetworkError } from '@universal-license/client';

export function LicenseActivation() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async (licenseKey) => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.validate({
        licenseKey,
        deviceId: await DeviceFingerprint.generate(),
      });

      if (!result.valid) {
        setError(result.error);
      }
    } catch (error) {
      if (error instanceof NetworkError) {
        setError('Network error - please check your connection');
      } else if (error instanceof ValidationError) {
        setError('License validation failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        placeholder="Enter license key"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleValidate(e.target.value);
          }
        }}
      />
      {loading && <p>Validating...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

## Logging and Debugging

Enable debug logging to see detailed error information:

```javascript
const client = new LicenseClient({
  baseUrl: 'https://license.yourdomain.com/api',
  debug: true, // Log all requests, responses, and errors
});

// Now you'll see:
// [License SDK] POST /api/licenses/validate
// [License SDK] Error: Network timeout
// [License SDK] Retrying... (Attempt 2 of 3)
```

Debug mode logs:

- All requests and responses
- Retry attempts
- Cache operations
- Error details

## Error Messages

Common error messages and what they mean:

| Message               | Cause                                      | Solution                                   |
| --------------------- | ------------------------------------------ | ------------------------------------------ |
| `License has expired` | Validation date is past license expiration | Renew the license                          |
| `License was revoked` | License was manually revoked by admin      | Contact support                            |
| `Device mismatch`     | License bound to different device          | Use correct device or contact support      |
| `Tier insufficient`   | License tier doesn't meet requirement      | Upgrade to higher tier                     |
| `Network timeout`     | Server took too long to respond            | Check connection, increase timeout         |
| `Cannot reach server` | Server unreachable (no internet, down)     | Check connection, retry later              |
| `Missing features`    | License doesn't have required features     | Upgrade license or use lower tier features |

## Best Practices

### 1. Always Catch Errors

```javascript
// ❌ Bad - unhandled promise rejection
client.validate({ licenseKey, deviceId });

// ✅ Good - errors are caught
try {
  await client.validate({ licenseKey, deviceId });
} catch (error) {
  handleError(error);
}
```

### 2. Distinguish Error Types

```javascript
// ❌ Treating all errors the same
try {
  await client.validate(data);
} catch (error) {
  showGenericError();
}

// ✅ Handle different error types appropriately
try {
  await client.validate(data);
} catch (error) {
  if (error instanceof NetworkError) {
    showOfflineMode();
  } else if (error instanceof ValidationError) {
    showLicenseExpiredPrompt();
  }
}
```

### 3. User-Friendly Messages

```javascript
// ❌ Technical error messages
catch (error) {
    alert(error.message);  // "ECONNREFUSED 127.0.0.1:3001"
}

// ✅ User-friendly messages
catch (error) {
    if (error instanceof NetworkError) {
        alert('Unable to reach the license server. Please check your internet connection.');
    } else {
        alert('An error occurred. Please try again later.');
    }
}
```

### 4. Provide Recovery Options

```javascript
// ✅ Give users ways to recover
async function handleValidationError(error) {
  if (error instanceof NetworkError) {
    // Option 1: Use cached data
    const cached = getCachedLicense();
    if (cached) {
      showMessage('Using cached license. Please reconnect to sync.');
      return cached;
    }

    // Option 2: Retry
    showRetryDialog(() => {
      return client.validate(data);
    });
  }
}
```

## Next Steps

- [License Validation](/guide/license-validation) - Validate licenses
- [Configuration](/config/sdk-config) - Configure error handling
- [Timeout & Retries](/config/timeout-retries) - Configure retry behavior
