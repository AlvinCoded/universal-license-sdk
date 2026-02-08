# Environment Variables

## Overview

Environment variables allow you to configure the SDK differently for different environments
(development, staging, production) without changing your code. This is critical for managing
sensitive information like API keys and secrets.

## Recommended Variables

### Core Configuration

```env
# License Server endpoint
LICENSE_SERVER_URL=https://your-license-server.com/api

# Caching behavior
LICENSE_CACHE_ENABLED=true
LICENSE_CACHE_TTL=3600

# Network behavior
LICENSE_TIMEOUT=30
LICENSE_RETRIES=3

# Debugging
LICENSE_DEBUG=false
```

### By Environment

**Development (.env.local)**

```env
LICENSE_SERVER_URL=http://localhost:3001/api
LICENSE_CACHE_ENABLED=false
LICENSE_TIMEOUT=60
LICENSE_DEBUG=true
```

**Production (.env.production)**

```env
LICENSE_SERVER_URL=https://license.yourdomain.com/api
LICENSE_CACHE_ENABLED=true
LICENSE_CACHE_TTL=3600
LICENSE_TIMEOUT=30
LICENSE_DEBUG=false
```

## JavaScript/TypeScript Setup

### Vite Projects

Create `.env.local` in your project root. Vite automatically loads environment files and exposes
variables prefixed with `VITE_`:

```env
# .env.local
VITE_LICENSE_SERVER_URL=https://your-server.com/api
VITE_LICENSE_CACHE=true
VITE_LICENSE_TIMEOUT=30000
VITE_LICENSE_DEBUG=false
```

Access in your code using `import.meta.env`:

```typescript
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: import.meta.env.VITE_LICENSE_SERVER_URL,
  cache: import.meta.env.VITE_LICENSE_CACHE === 'true',
  timeout: parseInt(import.meta.env.VITE_LICENSE_TIMEOUT || '30000'),
  debug: import.meta.env.VITE_LICENSE_DEBUG === 'true',
});
```

### Create React App (CRA)

Create `.env.local` in your project root. CRA requires variables to be prefixed with `REACT_APP_`:

```env
# .env.local
REACT_APP_LICENSE_SERVER_URL=https://your-server.com/api
REACT_APP_LICENSE_CACHE=true
REACT_APP_LICENSE_TIMEOUT=30000
REACT_APP_LICENSE_DEBUG=false
```

Access using `process.env`:

```jsx
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: process.env.REACT_APP_LICENSE_SERVER_URL,
  cache: process.env.REACT_APP_LICENSE_CACHE === 'true',
  timeout: parseInt(process.env.REACT_APP_LICENSE_TIMEOUT || '30000'),
  debug: process.env.REACT_APP_LICENSE_DEBUG === 'true',
});
```

### Next.js

Create `.env.local`. Next.js exposes variables to the browser without prefix (they're automatically
filtered for security):

```env
# .env.local
NEXT_PUBLIC_LICENSE_SERVER_URL=https://your-server.com/api
NEXT_PUBLIC_LICENSE_CACHE=true
NEXT_PUBLIC_LICENSE_TIMEOUT=30000
NEXT_PUBLIC_LICENSE_DEBUG=false
```

Only variables prefixed with `NEXT_PUBLIC_` are accessible in the browser. Server-side code can
access all variables:

```typescript
// Accessible everywhere
const serverSecret = process.env.API_SECRET;

// Browser only
const publicUrl = process.env.NEXT_PUBLIC_LICENSE_SERVER_URL;
```

### Node.js/Express

Install `dotenv` to load `.env` files:

```bash
npm install dotenv
```

Load it at the very top of your application:

```typescript
import 'dotenv/config';
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: process.env.LICENSE_SERVER_URL,
  cache: process.env.LICENSE_CACHE === 'true',
  timeout: parseInt(process.env.LICENSE_TIMEOUT || '30000'),
  debug: process.env.LICENSE_DEBUG === 'true',
});
```

## PHP/Laravel Setup

Laravel automatically loads `.env` files using Composer's `vlucas/phpdotenv` package.

Create `.env` in your project root:

```env
# .env
LICENSE_SERVER_URL=https://your-server.com/api
LICENSE_CACHE_ENABLED=true
LICENSE_CACHE_TTL=3600
LICENSE_TIMEOUT=30
LICENSE_DEBUG=false
```

Access using the `env()` helper:

```php
$client = new LicenseClient([
    'baseUrl' => env('LICENSE_SERVER_URL'),
    'cache' => env('LICENSE_CACHE_ENABLED', true),
    'cacheTTL' => env('LICENSE_CACHE_TTL', 3600),
    'timeout' => env('LICENSE_TIMEOUT', 30),
    'debug' => env('LICENSE_DEBUG', false),
]);
```

Or in your configuration file:

```php
// config/license.php
return [
    'base_url' => env('LICENSE_SERVER_URL', 'https://license.yourdomain.com/api'),
    'cache' => env('LICENSE_CACHE_ENABLED', true),
    'cache_ttl' => env('LICENSE_CACHE_TTL', 3600),
    'timeout' => env('LICENSE_TIMEOUT', 30),
    'debug' => env('LICENSE_DEBUG', false),
];
```

### Environment Files

Laravel uses different `.env` files for different environments:

- `.env` - Default configuration
- `.env.local` - Local overrides (gitignored)
- `.env.production` - Production overrides
- `.env.testing` - Test environment overrides

Never commit `.env.local` to version control. Add it to `.gitignore`:

```bash
# .gitignore
.env
.env.local
.env.*.local
```

## Best Practices

### Never Commit Secrets

Always add `.env.local` and similar files to `.gitignore`:

```bash
# .gitignore (JavaScript)
.env.local
.env.*.local

# .gitignore (PHP/Laravel)
.env
.env.local
.env.*.local
.env.backup
```

### Use `.env.example`

Create a template showing required variables:

```bash
# .env.example (commit this!)
LICENSE_SERVER_URL=https://your-server.com/api
LICENSE_CACHE_ENABLED=true
LICENSE_CACHE_TTL=3600
LICENSE_TIMEOUT=30
LICENSE_DEBUG=false
```

Team members can copy this to `.env.local` and fill in their values.

### Type Casting

Environment variables are always strings. Cast them to proper types:

```javascript
// ❌ Wrong - will always be truthy (even "false" is truthy string)
if (process.env.LICENSE_DEBUG) {
  // ...
}

// ✅ Correct
const debug = process.env.LICENSE_DEBUG === 'true';
if (debug) {
  // ...
}

// ✅ For numbers
const timeout = parseInt(process.env.LICENSE_TIMEOUT || '30000');
```

### Validation

Validate required environment variables on startup:

```javascript
const requiredVars = ['LICENSE_SERVER_URL'];
const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}
```

### Default Values

Always provide sensible defaults:

```php
$serverUrl = env('LICENSE_SERVER_URL', 'https://license.yourdomain.com/api');
$timeout = (int)env('LICENSE_TIMEOUT', 30);
$cache = env('LICENSE_CACHE_ENABLED', true);
```

If an environment variable isn't set, the default value is used. This makes your application more
resilient.

## Deployment Considerations

### Heroku

Set environment variables in the Heroku dashboard or CLI:

```bash
heroku config:set LICENSE_SERVER_URL=https://your-server.com/api
heroku config:set LICENSE_CACHE_ENABLED=true
heroku config:set LICENSE_DEBUG=false
```

### Railway/Render

Set environment variables in the project settings dashboard. These platforms automatically make them
available to your app.

### Docker

Pass environment variables when running the container:

```bash
docker run -e LICENSE_SERVER_URL=https://your-server.com/api \
           -e LICENSE_DEBUG=false \
           your-image
```

Or create a `.env` file and pass it:

```bash
docker run --env-file .env.production your-image
```

### AWS/DigitalOcean

Use their respective secrets management services (AWS Secrets Manager, DigitalOcean App Platform
environment variables) for sensitive values.

## Troubleshooting

### Variables Not Loading

**JavaScript:** Ensure you've imported `dotenv` before accessing variables:

```javascript
import 'dotenv/config'; // Must be first
import { doSomething } from './app';
```

**Laravel:** The `.env` file must be in your project root:

```bash
# Check file location
ls -la .env

# If missing, copy from example
cp .env.example .env
```

### Variables Not Updating

Environment variables are loaded once at startup. If you change `.env`, you must restart your
server.

### Browser Shows Undefined

In front-end code, only publicly exposed variables are available. Variables without the required
prefix (e.g., `VITE_`, `REACT_APP_`, `NEXT_PUBLIC_`) won't be visible:

```javascript
// ❌ Won't work (no VITE_ prefix)
console.log(import.meta.env.LICENSE_SECRET); // undefined

// ✅ Works (has VITE_ prefix)
console.log(import.meta.env.VITE_LICENSE_SERVER_URL); // "https://..."
```

## Next Steps

- [SDK Configuration](/config/sdk-config) - Configure the SDK client
- [Cache Settings](/config/cache) - Manage caching behavior
- [Timeout & Retries](/config/timeout-retries) - Handle network resilience
