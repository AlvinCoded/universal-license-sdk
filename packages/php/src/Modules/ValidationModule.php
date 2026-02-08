<?php

declare(strict_types=1);

namespace UniversalLicense\Modules;

use UniversalLicense\Http\HttpClient;
use UniversalLicense\Config\LicenseConfig;
use UniversalLicense\Models\ValidationResult;
use UniversalLicense\Validation\DeviceFingerprint;
use UniversalLicense\Exceptions\ValidationException;

/**
 * Validation Module
 * 
 * Handles license validation operations.
 * 
 * @package UniversalLicense\Modules
 */
class ValidationModule
{
    public function __construct(
        private HttpClient $http,
        private LicenseConfig $config
    ) {}
    
    /**
     * Validate a license key
     * 
     * Validates license against the Universal License Server.
     * 
     * @param array{
     *   licenseKey: string,
     *   deviceId?: string,
     *   requiredTier?: string,
     *   requiredFeatures?: array<string>
     * } $request Validation request data
     * @return ValidationResult
     * @throws ValidationException
     * 
     * @example
     * ```php
     * $result = $client->validation->validate([
    *     'licenseKey' => 'PROD-ORG-2025-XXXX-XXXX-XXXX',
     *     'deviceId' => DeviceFingerprint::generate(),
     *     'requiredTier' => 'pro',
     *     'requiredFeatures' => ['advancedReporting', 'financialManagement']
     * ]);
     * 
     * if ($result->valid) {
     *     echo "License is valid! Tier: " . $result->license->tier;
     *     
     *     // Access features
     *     if ($result->license->features['advancedReporting'] ?? false) {
     *         // Enable advanced reporting
     *     }
     * } else {
     *     echo "Validation failed: " . $result->error;
     * }
     * ```
     */
    public function validate(array $request): ValidationResult
    {
        // Auto-generate device ID if not provided
        if (!isset($request['deviceId'])) {
            $request['deviceId'] = DeviceFingerprint::generate();
        }
        
        // Validate license key format
        if (!$this->isValidLicenseKeyFormat($request['licenseKey'])) {
            throw new ValidationException('Invalid license key format');
        }
        
        // Call backend validation endpoint
        $response = $this->http->post('/licenses/validate', $request);
        
        return ValidationResult::fromArray($response->toArray());
    }
    
    /**
     * Validate with automatic caching
     * 
     * Caches validation results for faster subsequent checks.
     * Useful for applications that need to validate frequently.
     * 
     * @param string $licenseKey License key to validate
     * @param string|null $deviceId Device fingerprint (auto-generated if null)
     * @param int $cacheTtl Cache TTL in seconds (default: 3600 = 1 hour)
     * @return ValidationResult
     * 
     * @example
     * ```php
     * // First call hits API
    * $result = $client->validation->validateWithCache('PROD-ORG-2025-XXXX-XXXX-XXXX', null, 3600);
     * 
     * // Second call within 1 hour returns cached result
    * $result = $client->validation->validateWithCache('PROD-ORG-2025-XXXX-XXXX-XXXX', null, 3600);
     * ```
     */
    public function validateWithCache(
        string $licenseKey,
        ?string $deviceId = null,
        int $cacheTtl = 3600
    ): ValidationResult {
        $deviceId = $deviceId ?? DeviceFingerprint::generate();
        $cacheKey = "license:validation:{$licenseKey}:{$deviceId}";
        
        // Try cache first
        if ($this->config->isCacheEnabled()) {
            $cached = $this->http->getFromCache($cacheKey);
            if ($cached !== null) {
                return ValidationResult::fromArray($cached);
            }
        }
        
        // Validate via API
        $result = $this->validate([
            'licenseKey' => $licenseKey,
            'deviceId' => $deviceId
        ]);
        
        // Cache valid results only
        if ($this->config->isCacheEnabled() && $result->valid) {
            $this->http->saveToCache($cacheKey, $result->toArray(), $cacheTtl);
        }
        
        return $result;
    }

    /**
     * Get cached validation result (convenience)
     *
     * Reads the validation cache and returns the cached ValidationResult if available.
     *
     * @param string $licenseKey
     * @param string|null $deviceId
     * @return ValidationResult|null
     *
     * @example
     * ```php
     * $cached = $client->validation->getCachedValidation('LIC-...');
     * if ($cached) {
     *     echo $cached->valid ? 'cached valid' : 'cached invalid';
     * }
     * ```
     */
    public function getCachedValidation(string $licenseKey, ?string $deviceId = null): ?ValidationResult
    {
        $deviceId = $deviceId ?? DeviceFingerprint::generate();
        $cacheKey = "license:validation:{$licenseKey}:{$deviceId}";

        $cached = $this->http->getFromCache($cacheKey);
        if ($cached === null) {
            return null;
        }

        return ValidationResult::fromArray((array) $cached);
    }
    
    /**
     * Get RSA public key for offline signature verification
     * 
     * Retrieves the server's public key for client-side license verification.
     * 
     * @return string Public key in PEM format
     * 
     * @example
     * ```php
     * $publicKey = $client->validation->getPublicKey();
     * 
     * // Use with LicenseValidator::verifySignature()
     * $isValid = LicenseValidator::verifySignature(
     *     $licenseData,
     *     $signature,
     *     $publicKey
     * );
     * ```
     */
    public function getPublicKey(): string
    {
        $response = $this->http->get('/licenses/keys/public');
        return $response->get('publicKey', '');
    }

    /**
     * Get rotation-aware public key response.
     *
     * Returns legacy `publicKey` and (when supported by the server) `kid` + `keys[]`.
     */
    public function getPublicKeySet(): array
    {
        return $this->http->get('/licenses/keys/public')->toArray();
    }
    
    /**
     * Quick validation check (boolean only)
     * 
     * Simplified validation that returns only true/false.
     * 
     * @param string $licenseKey License key to validate
     * @param string|null $deviceId Device fingerprint
     * @return bool True if valid, false otherwise
     * 
     * @example
     * ```php
     * if ($client->validation->isValid('PROD-ORG-2025-XXXX-XXXX-XXXX')) {
     *     // License is valid
     * } else {
     *     // License is invalid or expired
     * }
     * ```
     */
    public function isValid(string $licenseKey, ?string $deviceId = null): bool
    {
        try {
            $result = $this->validate([
                'licenseKey' => $licenseKey,
                'deviceId' => $deviceId ?? DeviceFingerprint::generate()
            ]);

            return (bool) $result->valid;
        } catch (\Throwable $e) {
            return false;
        }
    }
    
    /**
     * Validate license key format
     * 
     * @param string $licenseKey License key to validate
     * @return bool True if format is valid
     */
    private function isValidLicenseKeyFormat(string $licenseKey): bool
    {
        // Format: PRODUCT-ORG-YEAR-XXXX-XXXX-XXXX
        // Example: PROD-ORG-2025-XXXX-XXXX-XXXX
        $pattern = '/^[A-Z0-9]+-[A-Z]{3}-\d{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/';
        return preg_match($pattern, $licenseKey) === 1;
    }
}