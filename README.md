# Universal License SDK

Multi-language client SDK for Universal License Server.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

## 📦 Packages

This monorepo contains multiple packages for different languages and frameworks:

| Package                                      | Description                | Version                                                                                                                                      | Docs                           |
| -------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| [@unilic/core](packages/core)                | Shared types and utilities | [![npm](https://img.shields.io/npm/v/@unilic/core)](https://www.npmjs.com/package/@unilic/core)                                              | [📖](packages/core/README.md)  |
| [@unilic/client](packages/js)                | JavaScript/TypeScript SDK  | [![npm](https://img.shields.io/npm/v/@unilic/client)](https://www.npmjs.com/package/@unilic/client)                                          | [📖](packages/js/README.md)    |
| [@unilic/react](packages/react)              | React hooks and components | [![npm](https://img.shields.io/npm/v/@unilic/react)](https://www.npmjs.com/package/@unilic/react)                                            | [📖](packages/react/README.md) |
| [universal-license-php-client](packages/php) | PHP SDK                    | [![Packagist](https://img.shields.io/packagist/v/universal-license-php-client)](https://packagist.org/packages/universal-license-php-client) | [📖](packages/php/README.md)   |

## Quick Start

### JavaScript/TypeScript

```bash
npm install @unilic/client
# or
pnpm add @unilic/client
```

```typescript
import { LicenseClient, DeviceFingerprint } from '@unilic/client';

const client = new LicenseClient({
  baseUrl: 'https://your-license-server.com/api',
});

// Validate a license
const result = await client.validate({
  licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
  deviceId: await DeviceFingerprint.generate(),
});

if (result.valid) {
  console.log('License is valid!', result.license);
}
```

### React

```bash
npm install @unilic/react @unilic/client
```

```tsx
import { LicenseProvider, useLicenseValidation } from '@unilic/react';

function App() {
  return (
    <LicenseProvider config={{ baseUrl: 'https://your-license-server.com/api' }}>
      <OnboardingPage />
    </LicenseProvider>
  );
}

function OnboardingPage() {
  const { validate, validation, loading } = useLicenseValidation();

  const handleSubmit = (key: string) => {
    validate(key);
  };

  return (/* Your UI */);
}
```

## 📚 Documentation

- Start here: [docs/getting-started.md](docs/getting-started.md)
- API reference index: [docs/api/index.md](docs/api/index.md)

## 🏗️ Development

This is a **monorepo** managed with [pnpm workspaces](https://pnpm.io/workspaces) (+ Lerna).

```bash
pnpm install
pnpm run build
pnpm run test
pnpm run typecheck
pnpm run lint
```

### Testing Locally

```bash
# In this repo
pnpm run link:local

# In your app (choose one)
npm link @unilic/client
pnpm link --global @unilic/client
```

Unlink:

```bash
npm unlink @unilic/client
pnpm unlink --global @unilic/client
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT License - see the [LICENSE](LICENSE) file for details.
