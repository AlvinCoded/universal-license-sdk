# Laravel Installation

## Overview

`universal-license/laravel` provides seamless Laravel integration:

- **Service Provider** - Automatic package registration
- **Facade** - `License::validate()` static methods
- **Middleware** - Protect routes: `license:pro`, `license.feature:reporting`
- **Artisan Commands** - CLI tools for license management
- **Blade Directives** - Template helpers: `@hasLicense`, `@hasFeature`
- **Configuration** - Publish and customize settings

Supports Laravel 9+

## Installation

### Prerequisites

- Laravel 9+ (tested on 9, 10, 11)
- PHP 8.0+
- Composer

### Install Package

```bash
composer require universal-license/php-client universal-license/laravel
```

### Publish Configuration

```bash
php artisan vendor:publish --provider="UniversalLicense\Laravel\LicenseServiceProvider"
```

This creates:

- `config/license.php` - Configuration file
- `app/Services/LicenseService.php` - Optional service class

### Configure Environment

Edit `.env`:

```env
LICENSE_SERVER_URL=https://your-license-server.com/api
LICENSE_CACHE_ENABLED=true
LICENSE_CACHE_TTL=3600
LICENSE_TIMEOUT=30
LICENSE_DEBUG=false
```

### Verify Installation

```bash
php artisan license:info
```

Should output license configuration status.

## Configuration

### config/license.php

```php
<?php

return [
    /**
     * License server API endpoint
     */
    'base_url' => env('LICENSE_SERVER_URL', 'https://your-license-server.com/api'),

    /**
     * Enable automatic response caching
     */
    'cache' => env('LICENSE_CACHE_ENABLED', true),

    /**
     * Cache time-to-live (seconds)
     */
    'cache_ttl' => env('LICENSE_CACHE_TTL', 3600),

    /**
     * Request timeout (seconds)
     */
    'timeout' => env('LICENSE_TIMEOUT', 30),

    /**
     * Enable debug logging
     */
    'debug' => env('LICENSE_DEBUG', false),

    /**
     * Cache store (file, redis, database, etc.)
     */
    'cache_store' => env('CACHE_DRIVER', 'file'),
];
```

## Basic Usage

### Using the Facade

```php
<?php

namespace App\Http\Controllers;

use UniversalLicense\Facades\License;
use UniversalLicense\Validation\DeviceFingerprint;

class DashboardController {
    public function index() {
        $licenseKey = auth()->user()->license_key;

        $result = License::validate([
            'licenseKey' => $licenseKey,
            'deviceId' => DeviceFingerprint::generateForLaravel()
        ]);

        if (!$result->valid) {
            return redirect('/license-expired');
        }

        return view('dashboard', ['license' => $result->license]);
    }
}
```

### Using Dependency Injection

```php
<?php

namespace App\Services;

use UniversalLicense\LicenseClient;

class FeatureService {
    public function __construct(
        private LicenseClient $client
    ) {}

    public function hasFeature(string $feature, string $licenseKey): bool {
        $result = $this->client->validation->validate([
            'licenseKey' => $licenseKey
        ]);

        return $result->license->features[$feature] ?? false;
    }
}
```

### Using Helper Function

```php
// Check if license is valid
if (license_valid($licenseKey)) {
    // License is valid
}

// Check if feature is enabled
if (license_has_feature('reporting', $licenseKey)) {
    // Feature is available
}

// Check tier
if (license_tier_at_least('pro', $licenseKey)) {
    // License is pro or higher
}
```

## Middleware

### Protect Routes with License Tier

```php
// routes/web.php

Route::middleware('license:pro')->group(function () {
    Route::get('/advanced-reporting', [ReportingController::class, 'advanced']);
    Route::get('/exports', [ExportController::class, 'index']);
});

// Or on individual routes
Route::get('/dashboard', DashboardController::class)->middleware('license:standard');
```

### Protect Routes with Features

```php
Route::middleware('license.feature:reporting,exports')->group(function () {
    Route::get('/reports', [ReportingController::class, 'index']);
    Route::get('/exports', [ExportController::class, 'index']);
});
```

### Get License from Middleware

The middleware automatically stores the validated license in the request:

```php
class LicenseAwareController {
    public function show(Request $request) {
        $license = $request->license; // Set by middleware

        return view('details', ['license' => $license]);
    }
}
```

## Artisan Commands

### Validate License

```bash
php artisan license:validate PROD-ORG-2025-XXXX-XXXX-XXXX
```

Output:

```
✅ License is valid
Organization: Example Organization
Tier: pro
Expires: 2026-01-15
```

### Clear Cache

```bash
php artisan license:cache-clear
```

### Get License Info

```bash
php artisan license:info
```

Output:

```
License Server Configuration:
  Base URL: https://your-license-server.com/api
  Cache Enabled: true
  Cache TTL: 3600 seconds
  Timeout: 30 seconds
```

## Blade Directives

### Check if License is Valid

```blade
@hasLicense($licenseKey)
    <div>License is valid!</div>
@else
    <div>License is invalid or expired</div>
@endhasLicense
```

### Check Feature Access

```blade
@hasFeature('reporting')
    <a href="/reports">View Reports</a>
@endhasFeature
```

### Check Tier

```blade
@hasTier('pro')
    <div>Pro features enabled</div>
@endhasTier
```

### Full Example

```blade
@auth
    @if(auth()->user()->license_key)
        @hasLicense(auth()->user()->license_key)
            <div class="alert alert-success">
                License is active!

                @hasFeature('reporting')
                    <br>
                    <a href="/reports">View Advanced Reports</a>
                @endhasFeature
            </div>
        @else
            <div class="alert alert-danger">
                Your license has expired. Please renew it.
                <a href="/renewal">Renew Now</a>
            </div>
        @endhasLicense
    @endif
@endauth
```

## Service Provider

Register additional services in your app's service provider:

```php
// app/Providers/AppServiceProvider.php

use UniversalLicense\Facades\License;

public function boot() {
    // Share license data with all views
    view()->share('license', function() {
        $key = auth()?->user()?->license_key;
        if (!$key) return null;

        return License::validate([
            'licenseKey' => $key
        ])->license;
    });
}
```

## Cache Configuration

### File Cache (Default)

```env
CACHE_DRIVER=file
LICENSE_CACHE_TTL=3600
```

Cache stored in `storage/framework/cache/`

### Redis Cache

```env
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
LICENSE_CACHE_TTL=3600
```

### Database Cache

```env
CACHE_DRIVER=database
LICENSE_CACHE_TTL=3600
```

Create cache table:

```bash
php artisan cache:table
php artisan migrate
```

## Event Listeners

React to license validation events:

```php
// app/Listeners/LicenseValidated.php

namespace App\Listeners;

use UniversalLicense\Events\LicenseValidated;

class HandleLicenseValidated {
    public function handle(LicenseValidated $event) {
        if ($event->isValid()) {
            // License is valid
            logger()->info("License validated: {$event->license->licenseKey}");
        } else {
            // License validation failed
            alert()->error("License validation failed");
        }
    }
}
```

Register in `EventServiceProvider`:

```php
protected $listen = [
    LicenseValidated::class => [
        HandleLicenseValidated::class,
    ],
];
```

## Background Jobs

### Validate All User Licenses

```bash
php artisan make:job ValidateUserLicenses
```

```php
// app/Jobs/ValidateUserLicenses.php

namespace App\Jobs;

use App\Models\User;
use UniversalLicense\Facades\License;
use Illuminate\Bus\Queueable;

class ValidateUserLicenses implements ShouldQueue {
    use Queueable;

    public function handle() {
        User::whereNotNull('license_key')
            ->chunkById(100, function($users) {
                foreach ($users as $user) {
                    $result = License::validate([
                        'licenseKey' => $user->license_key
                    ]);

                    $user->update([
                        'license_valid' => $result->valid,
                        'last_validation_at' => now()
                    ]);
                }
            });
    }
}
```

Schedule in `kernel.php`:

```php
protected function schedule(Schedule $schedule) {
    $schedule->job(new ValidateUserLicenses)
        ->dailyAt('02:00');
}
```

## Troubleshooting

### Service Provider Not Registered

Ensure it's in `config/app.php`:

```php
'providers' => [
    // ...
    UniversalLicense\Laravel\LicenseServiceProvider::class,
],
```

### Configuration Not Published

Re-publish:

```bash
php artisan vendor:publish --provider="UniversalLicense\Laravel\LicenseServiceProvider" --force
```

### Facade Not Found

Add to `config/app.php`:

```php
'aliases' => [
    // ...
    'License' => UniversalLicense\Facades\License::class,
],
```

### Middleware Not Working

Ensure it's registered in HTTP kernel:

```php
// app/Http/Kernel.php

protected $routeMiddleware = [
    // ...
    'license' => \UniversalLicense\Laravel\Middleware\ValidateLicense::class,
];
```

### Cache Not Working

Clear all cache:

```bash
php artisan cache:clear
php artisan config:clear
```

## Verification

Test your setup:

```bash
php artisan tinker
```

```php
use UniversalLicense\Facades\License;

$result = License::validate([
    'licenseKey' => 'test-key'
]);

dd($result);
```

## Next Steps

- [SDK Configuration](/config/sdk-config) - Detailed configuration options
- [License Validation](/guide/license-validation) - Validation patterns and options
- [Feature Gating](/guide/feature-gating) - Gate routes/UI by tier/features
- [Examples](/examples/) - End-to-end patterns
- [Troubleshooting](/troubleshooting) - Diagnostics and common issues
