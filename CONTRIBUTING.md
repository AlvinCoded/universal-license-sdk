# Contributing to Universal License SDK

Thank you for your interest in contributing! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Git

### Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/alvincoded/universal-license-sdk
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Build all packages**

```bash
pnpm run build
```

4. **Run tests**

```bash
pnpm run test
```

## 📦 Monorepo Structure

```
universal-license-sdk/
├── packages/
│   ├── core/          # Shared types and utilities
│   ├── js/            # JavaScript/TypeScript SDK
│   ├── php/           # PHP SDK
│   └── react/         # React hooks and components
├── scripts/           # Build and automation scripts
└── docs/              # Documentation
```

## 🔧 Development Workflow

### Working on a Package

1. **Navigate to package directory**

```bash
cd packages/js  # or packages/react or packages/php
```

2. **Start watch mode**

```bash
pnpm run dev
```

3. **Make your changes**

4. **Run tests**

```bash
pnpm run test
```

5. **Commit your changes**

```bash
git add .
git commit -m "feat(client): add new feature"
```

### Testing Locally

Link packages to test in your application:

```bash
# In SDK directory
pnpm run link:local

# In your app directory
cd ../your-app
pnpm link @universal-license/client
```

## 📝 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes (dependencies, config, etc.)

### Scopes

- `core`: Core package
- `client`: JavaScript/TypeScript SDK
- `react`: React package
- `docs`: Documentation
- `scripts`: Build scripts

### Examples

```bash
feat(client): add offline validation support
fix(react): resolve hook dependency issue
docs(guides): update installation instructions
refactor(core): simplify type definitions
test(client): add validation tests
```

## 🧪 Testing

### Run all tests

```bash
pnpm run test
```

### Run tests in watch mode

```bash
pnpm run test:watch
```

### Run tests with coverage

```bash
pnpm run test:coverage
```

### Test specific package

```bash
cd packages/js
pnpm test
```

## 📚 Documentation

### Update documentation

Documentation is in the `docs/` directory and built with VitePress.

```bash
# Start dev server
pnpm run docs:dev

# Build documentation
pnpm run docs:build
```

### Add examples

Examples go in `packages/<package>/examples/`.

## 🔍 Code Quality

### Linting

```bash
# Check for errors
pnpm run lint

# Auto-fix issues
pnpm run lint:fix
```

### Type checking

```bash
pnpm run typecheck
```

### Pre-commit hooks

The project uses Husky and lint-staged to:

- Auto-format code with Prettier
- Lint with ESLint
- Type-check changed files

This runs automatically on `git commit`.

## 📦 Publishing

**Note:** Only maintainers can publish packages.

### Update versions

```bash
pnpm run version patch  # 1.0.0 → 1.0.1
pnpm run version minor  # 1.0.0 → 1.1.0
pnpm run version major  # 1.0.0 → 2.0.0
```

### Publish to npm

```bash
pnpm run publish
```

This will:

1. Run all tests
2. Lint all packages
3. Build all packages
4. Publish to npm
5. Create git tags

## 🐛 Reporting Issues

### Before submitting

1. Search existing issues
2. Check if the issue is already fixed in the latest version
3. Try to reproduce with a minimal example

### Submitting an issue

Include:

- SDK version
- Node.js version
- Operating system
- Steps to reproduce
- Expected behavior
- Actual behavior
- Code sample (if applicable)

## 🎯 Pull Request Process

1. **Fork the repository**

2. **Create a feature branch**

```bash
git checkout -b feat/my-feature
```

3. **Make your changes**

4. **Add tests** for new functionality

5. **Ensure all tests pass**

```bash
pnpm run test
pnpm run lint
pnpm run typecheck
```

6. **Commit your changes** using conventional commits

```bash
git commit -m "feat(client): add awesome feature"
```

7. **Push to your fork**

```bash
git push origin feat/my-feature
```

8. **Open a Pull Request** on GitHub

### PR Guidelines

- Keep PRs focused (one feature/fix per PR)
- Update documentation if needed
- Add tests for new features
- Ensure CI passes
- Link related issues

## 🤝 Code Review Process

1. Maintainers will review your PR
2. Address feedback and update PR
3. Once approved, maintainers will merge

## 📋 Checklist

Before submitting a PR, ensure:

- [ ] Code follows project conventions
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] PR description is clear
- [ ] No merge conflicts
- [ ] CI passes

## 💬 Getting Help

- 📖 [Documentation](../README.md)
- 🐛 [GitHub Issues](https://github.com/alvincoded/universal-license-sdk/issues)
- 💬 [GitHub Discussions](https://github.com/alvincoded/universal-license-sdk/discussions)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎉**
