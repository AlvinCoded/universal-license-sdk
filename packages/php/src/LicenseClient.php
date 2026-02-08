<?php

declare(strict_types=1);

namespace UniversalLicense;

use UniversalLicense\Config\LicenseConfig;
use UniversalLicense\Http\HttpClient;
use UniversalLicense\Modules\LicenseModule;
use UniversalLicense\Modules\ProductModule;
use UniversalLicense\Modules\PurchaseModule;
use UniversalLicense\Modules\ValidationModule;
use UniversalLicense\Modules\AuthModule;
use UniversalLicense\Modules\OrganizationModule;
use UniversalLicense\Modules\PlanModule;
use UniversalLicense\Modules\PaymentModule;
use UniversalLicense\Modules\ImportModule;
use UniversalLicense\Modules\ExportModule;
use UniversalLicense\Modules\HealthModule;
use UniversalLicense\Modules\RenewalModule;
use UniversalLicense\Modules\ActivityModule;
use UniversalLicense\Cache\CacheInterface;
use UniversalLicense\Cache\FileCache;

/**
 * Universal License Client
 * 
 * Main client for interacting with Universal License Server.
 * Works with Laravel, Symfony, WordPress, and vanilla PHP.
 * 
 * @package UniversalLicense
 */
class LicenseClient
{
    private HttpClient $httpClient;
    private LicenseConfig $config;
    
    public readonly LicenseModule $licenses;
    public readonly ProductModule $products;
    public readonly PurchaseModule $purchases;
    public readonly ValidationModule $validation;
    public readonly AuthModule $auth;
    public readonly OrganizationModule $organizations;
    public readonly PlanModule $plans;
    public readonly PaymentModule $payment;
    public readonly ImportModule $import;
    public readonly ExportModule $export;
    public readonly HealthModule $health;
    public readonly RenewalModule $renewal;
    public readonly ActivityModule $activity;
    
    /**
     * Create a new License Client instance
     * 
     * @param array<string, mixed> $config Configuration array
     * @throws \InvalidArgumentException If baseUrl is not provided
     * 
     * @example
     * ```php
     * $client = new LicenseClient([
     *     'baseUrl' => 'https://your-license-server.com/api',
     *     'apiKey' => 'optional-api-key',
     *     'cache' => true,
     *     'timeout' => 30,
     *     'debug' => false
     * ]);
     * ```
     */
    public function __construct(array $config)
    {
        $this->config = new LicenseConfig($config);
        $this->httpClient = new HttpClient($this->config);
        
        // Initialize modules
        $this->licenses = new LicenseModule($this->httpClient, $this->config);
        $this->products = new ProductModule($this->httpClient, $this->config);
        $this->purchases = new PurchaseModule($this->httpClient, $this->config);
        $this->validation = new ValidationModule($this->httpClient, $this->config);

        // Additional modules (match backend capabilities)
        $this->auth = new AuthModule($this->httpClient, $this->config);
        $this->organizations = new OrganizationModule($this->httpClient, $this->config);
        $this->plans = new PlanModule($this->httpClient, $this->config);
        $this->payment = new PaymentModule($this->httpClient, $this->config);
        $this->import = new ImportModule($this->httpClient, $this->config);
        $this->export = new ExportModule($this->httpClient, $this->config);
        $this->health = new HealthModule($this->httpClient, $this->config);
        $this->renewal = new RenewalModule($this->httpClient, $this->config);
        $this->activity = new ActivityModule($this->httpClient, $this->config);
    }
    
    /**
     * Get configuration
     */
    public function getConfig(): LicenseConfig
    {
        return $this->config;
    }
    
    /**
     * Set custom cache implementation
     */
    public function setCache(CacheInterface $cache): self
    {
        $this->httpClient->setCache($cache);
        return $this;
    }
    
    /**
     * Clear all cached data
     */
    public function clearCache(): void
    {
        $this->httpClient->clearCache();
    }

    /**
     * Set (or clear) bearer token for authenticated endpoints
     */
    public function setToken(?string $token): self
    {
        $this->httpClient->setToken($token);
        return $this;
    }

    /**
     * Convenience: get cached license (if available)
     *
     * @param string $licenseKey
     * @param string|null $deviceId
     * @return \UniversalLicense\Models\License|null
     */
    public function getCachedLicense(string $licenseKey, ?string $deviceId = null): ?\UniversalLicense\Models\License
    {
        return $this->licenses->getCached($licenseKey, $deviceId);
    }
    
    /**
     * Get HTTP client for advanced usage
     */
    public function getHttpClient(): HttpClient
    {
        return $this->httpClient;
    }
}