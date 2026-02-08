<?php

declare(strict_types=1);

namespace UniversalLicense\Laravel;

use Illuminate\Support\ServiceProvider;
use Illuminate\Contracts\Foundation\Application;
use UniversalLicense\LicenseClient;
use UniversalLicense\Cache\LaravelCache;

/**
 * Laravel Service Provider for Universal License SDK
 * 
 * Registers the SDK with Laravel's service container and provides
 * configuration, facades, middleware, and Artisan commands.
 * 
 * @package UniversalLicense\Laravel
 */
class LicenseServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services
     * 
     * @return void
     */
    public function boot(): void
    {
        // Publish configuration file
        $this->publishes([
            __DIR__ . '/config/license.php' => config_path('license.php'),
        ], 'license-config');
        
        // Register middleware
        $this->registerMiddleware();
        
        // Register commands
        if ($this->app->runningInConsole()) {
            $this->commands([
                Commands\ValidateLicenseCommand::class,
                Commands\CacheClearCommand::class,
                Commands\LicenseInfoCommand::class,
                Commands\CheckLicenseCommand::class,
            ]);
        }
        
        // Load views (if needed for error pages)
        $this->loadViewsFrom(__DIR__ . '/resources/views', 'license');
        
        // Publish views
        $this->publishes([
            __DIR__ . '/resources/views' => resource_path('views/vendor/license'),
        ], 'license-views');
    }
    
    /**
     * Register any application services
     * 
     * @return void
     */
    public function register(): void
    {
        // Merge configuration
        $this->mergeConfigFrom(
            __DIR__ . '/config/license.php',
            'license'
        );
        
        // Register the main License Client as a singleton
        $this->app->singleton(LicenseClient::class, function (Application $app) {
            $config = $app['config']['license'];
            
            // Create license client with Laravel config
            $client = new LicenseClient([
                'baseUrl' => $config['server_url'],
                'timeout' => $config['timeout'],
                'retries' => $config['retries'],
                'cache' => $config['cache']['enabled'],
                'debug' => $config['debug'],
                'token' => $config['auth']['token'] ?? null,
            ]);

            // Optionally login to obtain token (primarily for console/admin usage)
            if (empty($config['auth']['token']) && !empty($config['auth']['username']) && !empty($config['auth']['password'])) {
                try {
                    $client->auth->login($config['auth']['username'], $config['auth']['password']);
                } catch (\Throwable $e) {
                    // Don't hard-fail service registration; allow apps to handle auth separately.
                    // Consumers can call $client->auth->login(...) manually.
                }
            }
            
            // Use Laravel's cache if enabled
            if ($config['cache']['enabled']) {
                $cacheDriver = $config['cache']['driver'] ?? 'file';
                $cachePrefix = $config['cache']['prefix'] ?? 'license';
                
                $cache = new LaravelCache(
                    $app['cache']->store($cacheDriver),
                    $cachePrefix
                );
                
                $client->setCache($cache);
            }
            
            return $client;
        });
        
        // Alias for easier access
        $this->app->alias(LicenseClient::class, 'license');
    }
    
    /**
     * Register middleware
     * 
     * @return void
     */
    protected function registerMiddleware(): void
    {
        $router = $this->app['router'];
        
        // Register middleware aliases
        $router->aliasMiddleware('license', Middleware\ValidateLicense::class);
        $router->aliasMiddleware('license.feature', Middleware\CheckFeature::class);
        $router->aliasMiddleware('license.tier', Middleware\CheckTier::class);
    }
    
    /**
     * Get the services provided by the provider
     * 
     * @return array<string>
     */
    public function provides(): array
    {
        return [
            LicenseClient::class,
            'license',
        ];
    }
}