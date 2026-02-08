# SDK Build Scripts

Automation scripts for building, testing, and publishing the Universal License SDK.

## Scripts Overview

### 🔨 `build.sh`

**Purpose:** Build all SDK packages in dependency order

**Usage:**

```bash
./scripts/build.sh
```

**What it does:**

1. Cleans previous builds
2. Type-checks each package
3. Builds packages: core → js → react
4. Validates build output

**When to use:**

- Before publishing
- After making changes
- CI/CD pipelines

---

### 🧪 `test.sh`

**Purpose:** Run tests across all packages

**Usage:**

```bash
# Run all tests
./scripts/test.sh

# Run with coverage
./scripts/test.sh --coverage

# Run in watch mode
./scripts/test.sh --watch

# Test specific package
./scripts/test.sh --package=js
```

**What it does:**

1. Runs unit tests
2. Generates coverage reports
3. Validates all packages

**When to use:**

- Before commits
- CI/CD pipelines
- Development (watch mode)

---

### 🔍 `lint.sh`

**Purpose:** Lint code across all packages

**Usage:**

```bash
# Check for errors
./scripts/lint.sh

# Auto-fix issues
./scripts/lint.sh --fix
```

**What it does:**

1. TypeScript type checking
2. ESLint validation
3. Auto-fixes when possible

**When to use:**

- Before commits
- Pre-push hooks
- CI/CD pipelines

---

### 📦 `publish.sh`

**Purpose:** Publish packages to npm registry

**Usage:**

```bash
./scripts/publish.sh
```

**What it does:**

1. ✅ Validates git status (clean working directory)
2. ✅ Checks npm authentication
3. ✅ Runs full test suite
4. ✅ Runs linting
5. ✅ Builds all packages
6. ✅ Publishes to npm using Lerna
7. ✅ Creates git tags

**Prerequisites:**

- Clean git working directory
- npm login (`npm login`)
- All tests passing
- On main/master branch (recommended)

**When to use:**

- Release new versions
- After version bump

---

### 📌 `version.sh`

**Purpose:** Update versions across all packages

**Usage:**

```bash
# Patch version (1.0.0 → 1.0.1)
./scripts/version.sh patch

# Minor version (1.0.0 → 1.1.0)
./scripts/version.sh minor

# Major version (1.0.0 → 2.0.0)
./scripts/version.sh major

# Prerelease (1.0.0 → 1.0.1-alpha.0)
./scripts/version.sh prerelease
```

**What it does:**

1. Validates git status
2. Updates package.json versions
3. Updates lerna.json version
4. Creates git commit and tag

**When to use:**

- Before publishing
- Following semver guidelines

---

### 🚀 `dev.sh`

**Purpose:** Start development environment with hot reload

**Usage:**

```bash
# Start all packages in watch mode
./scripts/dev.sh

# Start specific package
./scripts/dev.sh --package=js
```

**What it does:**

1. Starts TypeScript compiler in watch mode
2. Rebuilds on file changes
3. Enables rapid development

**When to use:**

- Active development
- Testing changes locally

---

### 🧹 `clean.sh`

**Purpose:** Remove build artifacts and dependencies

**Usage:**

```bash
# Clean build artifacts only
./scripts/clean.sh

# Deep clean (includes node_modules)
./scripts/clean.sh --deep
```

**What it does:**

1. Removes dist/ folders
2. Removes coverage reports
3. Removes .tsbuildinfo files
4. (Deep) Removes node_modules

**When to use:**

- Fresh rebuild needed
- Troubleshooting build issues
- Before switching branches

---

### 🔗 `link-local.sh`

**Purpose:** Link SDK packages for local testing

**Usage:**

```bash
./scripts/link-local.sh
```

**What it does:**

1. Builds all packages
2. Creates global symlinks (pnpm link)
3. Allows testing SDK in your main project

**Example workflow:**

```bash
# 1. In SDK directory
cd universal-license-sdk
./scripts/link-local.sh

# 2. In your project (e.g., server or web app)
cd ../your-project
pnpm link @unilic/client

# 3. Test your changes
# The SDK is now linked and changes reflect immediately

# 4. Unlink when done
pnpm unlink @unilic/client
```

**When to use:**

- Testing SDK integration locally
- Developing SDK and application together
- Before publishing (smoke test)

---

## 🔄 Common Workflows

### Development Workflow

```bash
# 1. Start dev environment
./scripts/dev.sh --package=js

# 2. Make changes to packages/js/src/

# 3. Test changes (auto-rebuilds)
cd packages/js
pnpm test

# 4. Lint before commit
./scripts/lint.sh --fix
```

### Release Workflow

```bash
# 1. Ensure all changes committed
git status

# 2. Run full test suite
./scripts/test.sh --coverage

# 3. Lint everything
./scripts/lint.sh

# 4. Update version
./scripts/version.sh patch  # or minor/major

# 5. Build
./scripts/build.sh

# 6. Publish
./scripts/publish.sh

# 7. Push tags
git push --tags
```

### Testing in Main Project

```bash
# 1. Link SDK locally
cd universal-license-sdk
./scripts/link-local.sh

# 2. Link in your app or server
cd ../your-project
pnpm link @unilic/client

# 3. Test integration
# Make API calls using SDK

# 4. Unlink when done
pnpm unlink @unilic/client
```

---

## 🎯 Integration with Existing Project

These scripts work seamlessly with your existing services and web apps:

### Server Integration

Your license server uses these SDK endpoints:

- `/api/licenses/validate` → SDK's `client.validation.validate()`
- `/api/purchases/create-order` → SDK's `client.purchases.createOrder()`
- `/api/products` → SDK's `client.products.getAll()`

### Web App Integration

Your web app can use SDK:

- Replace `apiClient` calls with SDK methods
- Use React hooks from `@unilic/react`
- Feature gates using SDK's built-in helpers

### CI/CD Integration

Add to `.github/workflows/`:

```yaml
# .github/workflows/sdk-test.yml
name: SDK Tests

on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile
      - name: Typecheck
        run: pnpm run typecheck
      - name: Build
        run: pnpm run build
      - name: Test
        run: pnpm run test:coverage
      - name: Lint
        run: pnpm run lint
      - name: Docs build
        run: pnpm run docs:build
```

---

## 💡 Tips

1. **Always build before testing locally:**

   ```bash
   ./scripts/build.sh && ./scripts/test.sh
   ```

2. **Use watch mode during development:**

   ```bash
   ./scripts/dev.sh --package=js
   ```

3. **Clean rebuild if issues:**

   ```bash
   ./scripts/clean.sh --deep
   pnpm install
   ./scripts/build.sh
   ```

4. **Test before publishing:**
   ```bash
   ./scripts/link-local.sh
   # Test in your main project
   ./scripts/publish.sh
   ```

---

## 🆘 Troubleshooting

### Build fails

```bash
# Clean and rebuild
./scripts/clean.sh --deep
pnpm install
./scripts/build.sh
```

### Tests fail

```bash
# Run specific package tests
./scripts/test.sh --package=js

# Check coverage
./scripts/test.sh --coverage
```

### Publish fails

```bash
# Check npm login
npm whoami

# Ensure git is clean
git status

# Ensure tests pass
./scripts/test.sh
```

### Link issues

```bash
# Unlink all
cd packages/js && pnpm unlink --global
cd ../react && pnpm unlink --global

# Relink
cd ../..
./scripts/link-local.sh
```

---

## 📚 Related Documentation

- [Main SDK README](../README.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Package Documentation](../packages/js/README.md)
- [Examples](../packages/js/examples/)
