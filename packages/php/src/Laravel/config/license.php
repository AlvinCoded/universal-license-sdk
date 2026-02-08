<?php

return [
    /*
    |--------------------------------------------------------------------------
    | License Server URL
    |--------------------------------------------------------------------------
    |
    | The base URL of your server API.
    | Example: https://license.yourcompany.com/api
    |
    */
    'server_url' => env('LICENSE_SERVER_URL', 'http://localhost:3001/api'),
    
    /*
    |--------------------------------------------------------------------------
    | License Key
    |--------------------------------------------------------------------------
    |
    | Your application's license key. This should be stored securely
    | in your .env file.
    |
    */
    'license_key' => env('LICENSE_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Admin Authentication (Optional)
    |--------------------------------------------------------------------------
    |
    | Many backend endpoints (admin dashboard, exports/imports, revoke, etc.)
    | require a JWT bearer token. You can provide either:
    | - LICENSE_ADMIN_TOKEN (preferred), or
    | - LICENSE_ADMIN_USERNAME + LICENSE_ADMIN_PASSWORD (to login programmatically)
    |
    */
    'auth' => [
        'token' => env('LICENSE_ADMIN_TOKEN'),
        'username' => env('LICENSE_ADMIN_USERNAME'),
        'password' => env('LICENSE_ADMIN_PASSWORD'),
    ],
    
    /*
    |--------------------------------------------------------------------------
    | HTTP Client Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the HTTP client behavior for API requests.
    |
    */
    'timeout' => (int) env('LICENSE_TIMEOUT', 30),
    'retries' => (int) env('LICENSE_RETRIES', 3),
    'debug' => (bool) env('LICENSE_DEBUG', false),
    
    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    |
    | Configure caching for license validation results to reduce API calls.
    |
    */
    'cache' => [
        'enabled' => (bool) env('LICENSE_CACHE_ENABLED', true),
        'driver' => env('LICENSE_CACHE_DRIVER', env('CACHE_DRIVER', 'file')),
        'ttl' => (int) env('LICENSE_CACHE_TTL', 3600), // 1 hour
        'prefix' => env('LICENSE_CACHE_PREFIX', 'license'),
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Middleware Configuration
    |--------------------------------------------------------------------------
    |
    | Configure default behavior for license middleware.
    |
    */
    'middleware' => [
        // Automatically redirect to a specific route when validation fails
        'redirect_on_failure' => env('LICENSE_REDIRECT_ON_FAILURE'),
        
        // Custom error views (relative to resources/views)
        'views' => [
            'unauthorized' => 'vendor.license.unauthorized',
            'validation_failed' => 'vendor.license.validation-failed',
            'feature_denied' => 'vendor.license.feature-denied',
            'tier_denied' => 'vendor.license.tier-denied',
        ],
    ],
];