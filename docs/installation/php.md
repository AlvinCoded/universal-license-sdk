# PHP Installation

## Overview

`universal-license/php-client` works with:

- **Vanilla PHP** 8.0+
- **WordPress** plugins & themes
- **Laravel** 9+ (also see [Laravel Integration](/installation/laravel))
- **Symfony** 5+
- **Composer**-based projects

## Installation

### Prerequisites

- PHP 8.0 or higher
- Composer
- cURL extension (usually enabled by default)
- JSON extension (usually enabled by default)

### Install via Composer

```bash
composer require universal-license/php-client
```

This automatically downloads the package and its dependencies:

- `guzzlehttp/guzzle` - HTTP client

### Verify Installation

```bash
composer require universal-license/php-client
```

Check `composer.json`:

```json
{
  "require": {
    "universal-license/php-client": "^0.1.0"
  }
}
```

## Configuration

### Environment Variables

Create `.env` file in your project root:

```env
LICENSE_SERVER_URL=https://your-license-server.com/api
LICENSE_CACHE_ENABLED=true
LICENSE_CACHE_TTL=3600
LICENSE_TIMEOUT=30
LICENSE_DEBUG=false
```

Load with `vlucas/phpdotenv`:

```bash
composer require vlucas/phpdotenv
```

```php
<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$serverUrl = $_ENV['LICENSE_SERVER_URL'];
```

### Create License Client

**Vanilla PHP:**

```php
<?php
require_once __DIR__ . '/vendor/autoload.php';

use UniversalLicense\LicenseClient;

$client = new LicenseClient([
    'baseUrl' => 'https://your-license-server.com/api',
    'cache' => true,
    'timeout' => 30,
    'retries' => 3,
    'debug' => false
]);

// Use in your app
$result = $client->validation->validate([
    'licenseKey' => 'PROD-ORG-2025-XXXX-XXXX-XXXX',
    'deviceId' => $_SERVER['SERVER_NAME']
]);

if ($result->valid) {
    echo "✅ License valid!";
} else {
    echo "❌ License invalid: " . $result->error;
}
```

**With .env:**

```php
<?php
require_once __DIR__ . '/vendor/autoload.php';

use UniversalLicense\LicenseClient;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$client = new LicenseClient([
    'baseUrl' => $_ENV['LICENSE_SERVER_URL'],
    'cache' => $_ENV['LICENSE_CACHE_ENABLED'] === 'true',
    'timeout' => (int)$_ENV['LICENSE_TIMEOUT'],
    'debug' => $_ENV['LICENSE_DEBUG'] === 'true'
]);
```

### Setup with Different Frameworks

#### Laravel

See [Laravel Installation](/installation/laravel) for complete setup.

Quick setup:

```bash
composer require universal-license/php-client universal-license/laravel
php artisan vendor:publish --provider="UniversalLicense\Laravel\LicenseServiceProvider"
```

#### Symfony

```php
// config/services.yaml
services:
  UniversalLicense\LicenseClient:
    arguments:
      - baseUrl: '%env(LICENSE_SERVER_URL)%'
        cache: '%env(bool:LICENSE_CACHE_ENABLED)%'
        timeout: '%env(int:LICENSE_TIMEOUT)%'
```

Use in controllers:

```php
namespace App\Controller;

use UniversalLicense\LicenseClient;
use Symfony\Component\HttpFoundation\Response;

class LicenseController {
    public function validate(LicenseClient $client): Response {
        $result = $client->validation->validate([
            'licenseKey' => $request->get('license_key'),
            'deviceId' => gethostname()
        ]);

        return $this->json($result->toArray());
    }
}
```

#### WordPress

WordPress plugin development is still “just PHP” — you can use the same client in a plugin context.
The main differences are how you store configuration (e.g., `get_option`) and how you handle
errors/UX.

Basic usage in plugin:

```php
<?php
/*
Plugin Name: My Plugin
*/

require_once plugin_dir_path(__FILE__) . 'vendor/autoload.php';

use UniversalLicense\LicenseClient;
use UniversalLicense\Validation\DeviceFingerprint;

$client = new LicenseClient([
    'baseUrl' => get_option('license_server_url'),
    'cache' => true
]);

function validate_license() {
    global $client;

    $licenseKey = get_option('my_plugin_license_key');
    $result = $client->validation->validate([
        'licenseKey' => $licenseKey,
        'deviceId' => DeviceFingerprint::generateForWordPress()
    ]);

    if (!$result->valid) {
        wp_die('License validation failed');
    }
}

add_action('init', 'validate_license');
```

## TypeScript-like Type Hints

PHP 7.4+ supports type declarations:

```php
<?php
use UniversalLicense\LicenseClient;
use UniversalLicense\Models\ValidationResult;

class LicenseManager {
    private LicenseClient $client;

    public function __construct(LicenseClient $client) {
        $this->client = $client;
    }

    public function validate(string $licenseKey, string $deviceId): ValidationResult {
        return $this->client->validation->validate([
            'licenseKey' => $licenseKey,
            'deviceId' => $deviceId
        ]);
    }

    public function checkFeature(string $feature): bool {
        $result = $this->client->validation->validateWithCache(
            getenv('LICENSE_KEY'),
            gethostname()
        );

        return $result->license->features[$feature] ?? false;
    }
}
```

## Caching Setup

### File-based Cache (Default)

```php
$client = new LicenseClient([
    'baseUrl' => 'https://your-license-server.com/api',
    'cache' => true
]);
```

### Custom Cache Location

The base PHP client does not accept a `cachePath` config option. To change the cache directory, set
a cache implementation:

```php
use UniversalLicense\Cache\FileCache;

$client = new LicenseClient([
    'baseUrl' => 'https://your-license-server.com/api',
    'cache' => true,
]);

$client->setCache(new FileCache(__DIR__ . '/storage/license-cache'));
```

### No Cache

```php
$client = new LicenseClient([
    'baseUrl' => 'https://your-license-server.com/api',
    'cache' => false
]);
```

## API Usage Examples

### Validate License

```php
use UniversalLicense\LicenseClient;
use UniversalLicense\Validation\DeviceFingerprint;

$client = new LicenseClient([...]);

$result = $client->validation->validate([
    'licenseKey' => 'PROD-ORG-2025-XXXX-XXXX-XXXX',
    'deviceId' => DeviceFingerprint::generate(),
    'requiredTier' => 'pro',
    'requiredFeatures' => ['reporting', 'exports']
]);

if ($result->valid) {
    echo "License Tier: " . $result->license->tier;
    echo "Organization: " . $result->license->orgName;
} else {
    echo "Error: " . $result->error;
}
```

### Get All Products

```php
$products = $client->products->getAll();

foreach ($products as $product) {
    echo $product->productName . "\n";

    $plans = $client->products->getPlans($product->productCode);
    foreach ($plans as $plan) {
        echo "  - {$plan->planName}: \${$plan->priceAmount}\n";
    }
}
```

### Create Purchase Order

```php
$order = $client->purchases->createOrder([
    'planCode' => 'PROD-PRO',
    'organizationData' => [
        'orgName' => 'Example Organization',
        'ownerName' => 'Jane Doe',
        'ownerEmail' => 'owner@example.com',
        'address' => '123 Example St',
        'country' => 'USA'
    ]
]);

$orderId = $order['order']['orderId'];
$amount = $order['order']['amount'];

// Process payment...

// Complete purchase
$result = $client->purchases->completePurchase(
    $orderId,
    'payment_reference_id'
);

if ($result['success']) {
    $licenseKey = $result['license']['licenseKey'];
    echo "License generated: $licenseKey";
}
```

## Troubleshooting

### "Class not found" Error

Ensure you're including the autoloader:

```php
require_once __DIR__ . '/vendor/autoload.php';
```

Or if using a framework, ensure vendor autoload is included in your bootstrap.

### cURL Errors

Ensure cURL extension is installed:

```bash
# Check if cURL is available
php -i | grep -i curl

# Install on Ubuntu/Debian
sudo apt-get install php-curl
sudo systemctl restart apache2  # or nginx

# Or on macOS
brew install curl
```

### Connection Timeout

Increase timeout in configuration:

```php
$client = new LicenseClient([
    'baseUrl' => 'https://your-license-server.com/api',
    'timeout' => 60  // 60 seconds
]);
```

### Cache Permission Errors

Ensure cache directory is writable:

```bash
chmod -R 755 storage/license-cache
```

Or specify a writable path:

```php
use UniversalLicense\Cache\FileCache;

$client = new LicenseClient([
    'baseUrl' => 'https://your-license-server.com/api',
    'cache' => true,
]);

$client->setCache(new FileCache(sys_get_temp_dir() . '/license-cache'));
```

## Verification

Test your installation:

```php
<?php
require_once __DIR__ . '/vendor/autoload.php';

use UniversalLicense\LicenseClient;

try {
    $client = new LicenseClient([
        'baseUrl' => 'https://your-license-server.com/api'
    ]);

    echo "✅ Client initialized successfully\n";

    $result = $client->validation->validate([
        'licenseKey' => 'test-key',
        'deviceId' => gethostname()
    ]);

    if ($result instanceof \UniversalLicense\Models\ValidationResult) {
        echo "✅ SDK is working!\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
```

## Next Steps

- [License Validation](/guide/license-validation) - Validation patterns and options
- [API Reference](/api/) - Methods and request/response shapes
- [Laravel Integration](/installation/laravel) - Laravel-specific setup
- [Examples](/examples/) - End-to-end patterns
- [Troubleshooting](/troubleshooting) - Diagnostics and common issues
