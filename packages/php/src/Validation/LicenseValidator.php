<?php

declare(strict_types=1);

namespace UniversalLicense\Validation;

use UniversalLicense\Models\ValidationResult;
use UniversalLicense\Exceptions\ValidationException;

/**
 * License Validator
 * 
 * Client-side license validation utilities.
 * Provides offline validation capabilities using cached license data.
 * 
 * @package UniversalLicense\Validation
 */
class LicenseValidator
{
    /**
     * Validate license tier requirement
     * 
     * Checks if current license tier meets the required tier.
     * 
     * @param string $currentTier Current license tier (standard, pro, enterprise)
     * @param string $requiredTier Required tier for feature access
     * @return bool True if tier requirement is met
     * 
     * @example
     * ```php
     * $hasAccess = LicenseValidator::validateTier('pro', 'standard'); // true
     * $hasAccess = LicenseValidator::validateTier('standard', 'pro'); // false
     * ```
     */
    public static function validateTier(string $currentTier, string $requiredTier): bool
    {
        $tierHierarchy = [
            'standard' => 1,
            'pro' => 2,
            'enterprise' => 3,
        ];
        
        $currentLevel = $tierHierarchy[strtolower($currentTier)] ?? 0;
        $requiredLevel = $tierHierarchy[strtolower($requiredTier)] ?? 0;
        
        return $currentLevel >= $requiredLevel;
    }
    
    /**
     * Validate feature requirements
     * 
     * Checks if license has all required features enabled.
     * 
     * @param array<string, bool> $licenseFeatures Features available in license
     * @param array<string> $requiredFeatures Features required for access
     * @return array{valid: bool, missing: array<string>}
     * 
     * @example
     * ```php
     * $result = LicenseValidator::validateFeatures(
     *     ['reporting' => true, 'exports' => false],
     *     ['reporting', 'exports']
     * );
     * // ['valid' => false, 'missing' => ['exports']]
     * ```
     */
    public static function validateFeatures(
        array $licenseFeatures,
        array $requiredFeatures
    ): array {
        $missing = array_filter($requiredFeatures, function($feature) use ($licenseFeatures) {
            return !($licenseFeatures[$feature] ?? false);
        });
        
        return [
            'valid' => empty($missing),
            'missing' => array_values($missing),
        ];
    }
    
    /**
     * Check if license is expired
     * 
     * @param string|\DateTimeInterface $expiresAt License expiration date
     * @return bool True if license has expired
     * 
     * @example
     * ```php
     * $isExpired = LicenseValidator::isExpired('2024-12-31T23:59:59Z');
     * ```
     */
    public static function isExpired($expiresAt): bool
    {
        $expiryDate = self::parseDate($expiresAt);
        return $expiryDate < new \DateTime();
    }
    
    /**
     * Check if license is in grace period
     * 
     * Grace period allows continued use after expiration.
     * 
     * @param string|\DateTimeInterface $expiresAt License expiration date
     * @param int $gracePeriodDays Grace period in days (default: 30)
     * @return bool True if in grace period
     */
    public static function isInGracePeriod(
        $expiresAt,
        int $gracePeriodDays = 30
    ): bool {
        $expiryDate = self::parseDate($expiresAt);
        $graceEndDate = (clone $expiryDate)->modify("+{$gracePeriodDays} days");
        $now = new \DateTime();
        
        return $now > $expiryDate && $now <= $graceEndDate;
    }
    
    /**
     * Calculate days until expiration
     * 
     * @param string|\DateTimeInterface $expiresAt License expiration date
     * @return int Days until expiration (negative if expired)
     */
    public static function daysUntilExpiry($expiresAt): int
    {
        $expiryDate = self::parseDate($expiresAt);
        $now = new \DateTime();
        $interval = $now->diff($expiryDate);
        
        $days = (int) $interval->format('%r%a');
        return $days;
    }
    
    /**
     * Validate license key format
     * 
     * Checks if license key matches expected format.
     * Format: PRODUCT-ORG-YEAR-XXXX-XXXX-XXXX
     * 
     * @param string $licenseKey License key to validate
     * @return bool True if format is valid
     * 
     * @example
     * ```php
     * $valid = LicenseValidator::validateLicenseKeyFormat(
    *     'PROD-ORG-2025-XXXX-XXXX-XXXX'
     * ); // true
     * ```
     */
    public static function validateLicenseKeyFormat(string $licenseKey): bool
    {
        // Format: PRODUCT-ORG-YEAR-XXXX-XXXX-XXXX
        $pattern = '/^[A-Z0-9]+-[A-Z]{3}-\d{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/';
        return preg_match($pattern, $licenseKey) === 1;
    }
    
    /**
     * Extract product code from license key
     * 
     * @param string $licenseKey License key
     * @return string|null Product code or null if invalid format
     * 
     * @example
     * ```php
     * $productCode = LicenseValidator::extractProductCode(
    *     'PROD-ORG-2025-XXXX-XXXX-XXXX'
    * ); // "PROD"
     * ```
     */
    public static function extractProductCode(string $licenseKey): ?string
    {
        $parts = explode('-', $licenseKey);
        
        if (count($parts) < 2) {
            return null;
        }
        
        // Product code is first part (might have multiple segments)
        // e.g., "PROD" or "APP"
        if (count($parts) >= 3 && strlen($parts[1]) === 3) {
            // Format: PRODUCT-ORG-YEAR-...
            return $parts[0];
        }
        
        return null;
    }
    
    /**
     * Validate device binding
     * 
     * Checks if license is bound to current device.
     * 
     * @param string|null $licenseDeviceHash Device hash from license
     * @param string $currentDeviceId Current device ID
     * @return bool True if device matches or license not bound
     */
    public static function validateDeviceBinding(
        ?string $licenseDeviceHash,
        string $currentDeviceId
    ): bool {
        // If no device binding, license is valid for any device
        if ($licenseDeviceHash === null || $licenseDeviceHash === '') {
            return true;
        }
        
        $currentHash = DeviceFingerprint::hash($currentDeviceId);
        return hash_equals($licenseDeviceHash, $currentHash);
    }
    
    /**
     * Verify RSA signature (client-side verification)
     * 
     * Verifies license signature using public key.
     * 
     * @param array<string, mixed> $licenseData License data to verify
     * @param string $signature Base64-encoded signature
     * @param string $publicKeyPem Public key in PEM format
     * @return bool True if signature is valid
     * 
     * @throws ValidationException If verification fails
     */
    public static function verifySignature(
        array $licenseData,
        string $signature,
        string $publicKeyPem
    ): bool {
        try {
            // Create data string for verification
            $dataString = implode('|', [
                $licenseData['licenseKey'] ?? '',
                $licenseData['tier'] ?? '',
                $licenseData['deviceId'] ?? '',
                $licenseData['expiresAt'] ?? '',
            ]);
            
            // Decode signature
            $signatureBinary = base64_decode($signature, true);
            if ($signatureBinary === false) {
                throw new ValidationException('Invalid signature encoding');
            }
            
            // Get public key
            $publicKey = openssl_pkey_get_public($publicKeyPem);
            if ($publicKey === false) {
                throw new ValidationException('Invalid public key');
            }
            
            // Verify signature
            $result = openssl_verify(
                $dataString,
                $signatureBinary,
                $publicKey,
                OPENSSL_ALGO_SHA256
            );
            
            openssl_free_key($publicKey);
            
            if ($result === 1) {
                return true;
            } elseif ($result === 0) {
                return false;
            } else {
                throw new ValidationException('Signature verification error: ' . openssl_error_string());
            }
        } catch (\Exception $e) {
            throw new ValidationException(
                'Signature verification failed: ' . $e->getMessage()
            );
        }
    }
    
    /**
     * Validate complete license (comprehensive check)
     * 
     * Performs all validation checks at once.
     * 
     * @param array<string, mixed> $licenseData License data
     * @param array<string, mixed> $requirements Validation requirements
     * @return ValidationResult
     * 
     * @example
     * ```php
     * $result = LicenseValidator::validateLicense($license, [
     *     'requiredTier' => 'pro',
     *     'requiredFeatures' => ['reporting'],
     *     'deviceId' => DeviceFingerprint::generate()
     * ]);
     * 
     * if ($result->valid) {
     *     // License is valid
     * }
     * ```
     */
    public static function validateLicense(
        array $licenseData,
        array $requirements = []
    ): ValidationResult {
        $errors = [];
        
        // Check expiration
        if (isset($licenseData['expiresAt'])) {
            if (self::isExpired($licenseData['expiresAt'])) {
                $errors[] = 'License has expired';
            }
        }
        
        // Check tier requirement
        if (isset($requirements['requiredTier']) && isset($licenseData['tier'])) {
            if (!self::validateTier($licenseData['tier'], $requirements['requiredTier'])) {
                $errors[] = "Requires {$requirements['requiredTier']} tier or higher";
            }
        }
        
        // Check feature requirements
        if (isset($requirements['requiredFeatures']) && isset($licenseData['features'])) {
            $featureCheck = self::validateFeatures(
                $licenseData['features'],
                $requirements['requiredFeatures']
            );
            
            if (!$featureCheck['valid']) {
                $errors[] = 'Missing required features: ' . implode(', ', $featureCheck['missing']);
            }
        }
        
        // Check device binding
        if (isset($requirements['deviceId']) && isset($licenseData['deviceIdHash'])) {
            if (!self::validateDeviceBinding(
                $licenseData['deviceIdHash'],
                $requirements['deviceId']
            )) {
                $errors[] = 'License is bound to a different device';
            }
        }
        
        return new ValidationResult([
            'valid' => empty($errors),
            'errors' => $errors,
            'license' => $licenseData,
        ]);
    }
    
    /**
     * Parse date string or object to DateTime
     * 
     * @param string|\DateTimeInterface $date Date to parse
     * @return \DateTime
     * @throws \InvalidArgumentException If date is invalid
     */
    private static function parseDate($date): \DateTime
    {
        if ($date instanceof \DateTimeInterface) {
            return \DateTime::createFromInterface($date);
        }
        
        if (is_string($date)) {
            try {
                return new \DateTime($date);
            } catch (\Exception $e) {
                throw new \InvalidArgumentException('Invalid date format: ' . $date);
            }
        }
        
        throw new \InvalidArgumentException('Date must be string or DateTimeInterface');
    }
}