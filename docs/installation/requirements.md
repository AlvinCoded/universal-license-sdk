# Package Requirements

## System Requirements

### All Packages

- **Node.js** 18+ (for JavaScript/TypeScript/React)
- **PHP** 8.0+ (for PHP/Laravel)
- **npm, yarn, or pnpm** (JavaScript package managers)
- **Composer** (PHP package manager)

## JavaScript/TypeScript

### Minimum Node.js Version

```bash
node --version  # Should be 18 or higher
```

### npm/yarn/pnpm

```bash
npm --version      # 9.0+
yarn --version     # 1.22+
pnpm --version     # 8.0+
```

### Browser Support

- **Modern Browsers** (ES6+)
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

- **Older Browsers** (requires transpilation via Babel)

### Development Dependencies (Optional)

```json
{
  "devDependencies": {
    "typescript": "^5.0",
    "@types/node": "^18.0",
    "jest": "^29.0",
    "ts-jest": "^29.0"
  }
}
```

## React

### Minimum React Version

```json
{
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

React 18+ is required.

### Required for Specific Frameworks

**Next.js:**

```json
{
  "dependencies": {
    "next": ">=12.0"
  }
}
```

**Vite:**

```json
{
  "dependencies": {
    "vite": "^5.0",
    "@vitejs/plugin-react": "^4.0"
  }
}
```

**Create React App:**

- No special dependencies, works out of the box

## PHP

### Minimum PHP Version

```bash
php --version  # Should be 8.0 or higher
```

### Required Extensions

```bash
# Check enabled extensions
php -m | grep -E '(curl|json)'
```

- **curl** - For HTTP requests (almost always enabled)
- **json** - For JSON parsing (almost always enabled)

Enable if missing:

```bash
# Ubuntu/Debian
sudo apt-get install php-curl

# macOS with Homebrew
brew install php@8.0

# Windows - Edit php.ini
extension=curl
extension=json
```

### Composer

```bash
composer --version  # Should be 2.0+
```

Install if needed:

```bash
# macOS/Linux
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Windows
# Download from https://getcomposer.org/download/
```

### Optional Extensions

For enhanced features:

```bash
# Redis cache support
php-redis

# PostgreSQL database (if using PHP server)
php-pgsql
```

## Laravel

### Minimum Laravel Version

```json
{
  "require": {
    "laravel/framework": "^9.0"
  }
}
```

### PHP Extensions Required

Same as PHP package, plus:

- **pdo** - Database access
- **tokenizer** - Code parsing
- **xml** - XML processing

Most are included with standard Laravel installation.

### Composer

Same as PHP package.

## Network Requirements

### All Packages

- **Internet Connection** - To reach license server API
- **HTTPS** - Connection to license server (HTTP works for development)
- **DNS Resolution** - Can resolve license server domain
- **Port 443** - For HTTPS connections (or custom port if specified)
- **Port 80** - For HTTP connections (development only)

### Firewall/Proxy

If behind firewall:

```php
// PHP - Configure cURL proxy
$client = new LicenseClient([
    'proxy' => 'http://proxy-server:8080'
]);
```

```javascript
// JavaScript - Configure proxy via environment
process.env.HTTP_PROXY = 'http://proxy-server:8080';
process.env.HTTPS_PROXY = 'https://proxy-server:8080';
```

## Development Tools (Optional)

### For JavaScript

```bash
# TypeScript
npm install --save-dev typescript

# Testing
npm install --save-dev jest ts-jest @types/jest

# Linting
npm install --save-dev eslint typescript-eslint

# Code formatting
npm install --save-dev prettier
```

### For PHP

```bash
# Testing
composer require --dev phpunit/phpunit

# Code standards
composer require --dev squizlabs/php_codesniffer

# Static analysis
composer require --dev phpstan/phpstan

# Code formatting
composer require --dev friendsofphp/php-cs-fixer
```

## Dependency Tree

### JavaScript/TypeScript

```
@universal-license/client
├── guzzlehttp/guzzle (only for Node.js)
├── axios (alternative, if configured)
└── crypto (native)
```

### React

```
@universal-license/react
├── @universal-license/client
├── react (peer dependency)
└── react-dom (peer dependency)
```

### PHP

```
universal-license/php-client
├── guzzlehttp/guzzle ^7.8
└── (Optional) predis/predis (for Redis cache)
```

### Laravel

```
universal-license/laravel
├── universal-license/php-client
└── laravel/framework ^9.0
```

## Verification Checklist

### JavaScript

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Install and test
npm install @universal-license/client

# Verify
node -e "const {LicenseClient} = require('@universal-license/client'); console.log('✅ SDK loaded')"
```

### React

```bash
# Check npm packages installed
npm list react react-dom

# Verify installation
npm install @universal-license/react

# Test import
node -e "const {useLicenseValidation} = require('@universal-license/react'); console.log('✅ React SDK loaded')"
```

### PHP

```bash
# Check PHP version
php --version

# Check extensions
php -m | grep curl

# Install and test
composer require universal-license/php-client

# Verify
php -r "require 'vendor/autoload.php'; $c = new UniversalLicense\LicenseClient([]); echo '✅ SDK loaded';"
```

### Laravel

```bash
# Check Laravel version
php artisan --version

# Install package
composer require universal-license/laravel

# Publish config
php artisan vendor:publish --provider="UniversalLicense\Laravel\LicenseServiceProvider"

# Verify
php artisan license:info
```

## Troubleshooting

### Node/npm Version Issues

Update Node.js:

```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Using Homebrew
brew upgrade node
```

### PHP Version Issues

Update PHP:

```bash
# Ubuntu/Debian
sudo apt-get install php8.0

# macOS Homebrew
brew upgrade php@8.0

# Check current version
php --version
```

### Missing Extensions

Install cURL:

```bash
# Ubuntu/Debian
sudo apt-get install php-curl
sudo systemctl restart apache2

# macOS
brew install curl
php-fpm needs restart

# Windows
# Edit php.ini and uncomment: extension=curl
```

### Composer Issues

Clear cache and reinstall:

```bash
composer clear-cache
composer install --no-cache
```

### npm Issues

Clear npm cache:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

After meeting requirements:

- **JavaScript:** [JavaScript Installation](/installation/javascript)
- **React:** [React Installation](/installation/react)
- **PHP:** [PHP Installation](/installation/php)
- **Laravel:** [Laravel Installation](/installation/laravel)
