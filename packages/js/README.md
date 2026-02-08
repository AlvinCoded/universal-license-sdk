# @unilic/client

JavaScript/TypeScript SDK for Universal License Server - Secure license validation, purchase flows,
and subscription management.

## Installation

```bash
npm install @unilic/client
# or
yarn add @unilic/client
# or
pnpm add @unilic/client
```

## Quick Start

```typescript
import { LicenseClient, DeviceFingerprint } from '@unilic/client';

const client = new LicenseClient({
  baseUrl: 'https://license.yourcompany.com/api',
});

// Validate license
const result = await client.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: await DeviceFingerprint.generate(),
});

if (result.valid) {
  console.log('License valid!');
}
```

## Features

- **Type-Safe** - Full TypeScript support
- **Auto-Retry** - Built-in retry logic with exponential backoff
- **Caching** - Automatic response caching for performance
- **Tree-Shakeable** - Import only what you need
- **Cross-Platform** - Works in Browser and Node.js
- **Well-Documented** - Comprehensive JSDoc comments

## Documentation

See the [full documentation](../../docs/) for detailed usage guides.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
