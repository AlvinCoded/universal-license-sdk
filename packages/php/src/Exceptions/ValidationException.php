<?php

declare(strict_types=1);

namespace UniversalLicense\Exceptions;

/**
 * Validation Exception
 * 
 * Thrown when license validation fails.
 * Contains detailed information about why validation failed.
 * 
 * @package UniversalLicense\Exceptions
 */
class ValidationException extends LicenseException
{
    /**
     * Current tier (if tier insufficient)
     * 
     * @var string|null
     */
    protected ?string $currentTier = null;
    
    /**
     * Required tier (if tier insufficient)
     * 
     * @var string|null
     */
    protected ?string $requiredTier = null;
    
    /**
     * Missing features (if features insufficient)
     * 
     * @var array<string>
     */
    protected array $missingFeatures = [];
    
    /**
     * Validation reason code
     * 
     * @var string|null
     */
    protected ?string $reason = null;
    
    /**
     * Create validation exception for expired license
     * 
     * @param string $licenseKey License key
     * @param \DateTime|null $expiresAt Expiration date
     * @return static
     * 
     * @example
     * ```php
     * throw ValidationException::expired(
    *     'PROD-ORG-2025-XXXX-XXXX-XXXX',
     *     new DateTime('2025-01-15')
     * );
     * ```
     */
    public static function expired(string $licenseKey, ?\DateTime $expiresAt = null): static
    {
        $message = "License has expired";
        
        if ($expiresAt) {
            $message .= " on {$expiresAt->format('Y-m-d')}";
        }
        
        $exception = new static($message, 'LICENSE_EXPIRED', [
            'licenseKey' => $licenseKey,
            'expiresAt' => $expiresAt?->format('c'),
        ]);
        
        $exception->reason = 'EXPIRED';
        $exception->setStatusCode(400);
        
        return $exception;
    }
    
    /**
     * Create validation exception for revoked license
     * 
     * @param string $licenseKey License key
     * @param string|null $revokeReason Revocation reason
     * @return static
     * 
     * @example
     * ```php
     * throw ValidationException::revoked(
    *     'PROD-ORG-2025-XXXX-XXXX-XXXX',
     *     'Payment dispute'
     * );
     * ```
     */
    public static function revoked(string $licenseKey, ?string $revokeReason = null): static
    {
        $message = "License has been revoked";
        
        if ($revokeReason) {
            $message .= ": {$revokeReason}";
        }
        
        $exception = new static($message, 'LICENSE_REVOKED', [
            'licenseKey' => $licenseKey,
            'revokeReason' => $revokeReason,
        ]);
        
        $exception->reason = 'REVOKED';
        $exception->setStatusCode(403);
        
        return $exception;
    }
    
    /**
     * Create validation exception for insufficient tier
     * 
     * @param string $currentTier Current license tier
     * @param string $requiredTier Required tier
     * @return static
     * 
     * @example
     * ```php
     * throw ValidationException::insufficientTier('standard', 'pro');
     * // Output: "This feature requires pro tier or higher (current: standard)"
     * ```
     */
    public static function insufficientTier(string $currentTier, string $requiredTier): static
    {
        $message = "This feature requires {$requiredTier} tier or higher (current: {$currentTier})";
        
        $exception = new static($message, 'INVALID_TIER', [
            'currentTier' => $currentTier,
            'requiredTier' => $requiredTier,
        ]);
        
        $exception->currentTier = $currentTier;
        $exception->requiredTier = $requiredTier;
        $exception->reason = 'TIER_INSUFFICIENT';
        $exception->setStatusCode(403);
        
        return $exception;
    }
    
    /**
     * Create validation exception for missing features
     * 
     * @param array<string> $missingFeatures Missing feature names
     * @return static
     * 
     * @example
     * ```php
     * throw ValidationException::missingFeatures([
     *     'advancedReporting',
     *     'financialManagement'
     * ]);
     * ```
     */
    public static function missingFeatures(array $missingFeatures): static
    {
        $featureList = implode(', ', $missingFeatures);
        $message = "License does not include required features: {$featureList}";
        
        $exception = new static($message, 'MISSING_FEATURES', [
            'missingFeatures' => $missingFeatures,
        ]);
        
        $exception->missingFeatures = $missingFeatures;
        $exception->reason = 'FEATURES_INSUFFICIENT';
        $exception->setStatusCode(403);
        
        return $exception;
    }
    
    /**
     * Create validation exception for device mismatch
     * 
     * @param string $licenseKey License key
     * @return static
     * 
     * @example
     * ```php
    * throw ValidationException::deviceMismatch('PROD-ORG-2025-XXXX-XXXX-XXXX');
     * ```
     */
    public static function deviceMismatch(string $licenseKey): static
    {
        $message = "License is bound to a different device";
        
        $exception = new static($message, 'DEVICE_MISMATCH', [
            'licenseKey' => $licenseKey,
        ]);
        
        $exception->reason = 'DEVICE_MISMATCH';
        $exception->setStatusCode(403);
        
        return $exception;
    }
    
    /**
     * Create validation exception for not found license
     * 
     * @param string $licenseKey License key
     * @return static
     * 
     * @example
     * ```php
     * throw ValidationException::notFound('INVALID-KEY');
     * ```
     */
    public static function notFound(string $licenseKey): static
    {
        $message = "License not found";
        
        $exception = new static($message, 'INVALID_LICENSE', [
            'licenseKey' => $licenseKey,
        ]);
        
        $exception->reason = 'NOT_FOUND';
        $exception->setStatusCode(404);
        
        return $exception;
    }
    
    /**
     * Create validation exception for invalid license key format
     * 
     * @param string $licenseKey Invalid license key
     * @return static
     * 
     * @example
     * ```php
     * throw ValidationException::invalidFormat('abc123');
     * ```
     */
    public static function invalidFormat(string $licenseKey): static
    {
        $message = "Invalid license key format";
        
        $exception = new static($message, 'INVALID_LICENSE', [
            'licenseKey' => $licenseKey,
            'expectedFormat' => 'PRODUCT-ORG-YEAR-XXXX-XXXX-XXXX',
        ]);
        
        $exception->reason = 'INVALID_FORMAT';
        $exception->setStatusCode(400);
        
        return $exception;
    }
    
    /**
     * Get current tier
     * 
     * @return string|null
     */
    public function getCurrentTier(): ?string
    {
        return $this->currentTier;
    }
    
    /**
     * Get required tier
     * 
     * @return string|null
     */
    public function getRequiredTier(): ?string
    {
        return $this->requiredTier;
    }
    
    /**
     * Get missing features
     * 
     * @return array<string>
     */
    public function getMissingFeatures(): array
    {
        return $this->missingFeatures;
    }
    
    /**
     * Get validation reason
     * 
     * @return string|null
     */
    public function getReason(): ?string
    {
        return $this->reason;
    }
    
    /**
     * Check if validation failed due to tier
     * 
     * @return bool
     */
    public function isTierInsufficient(): bool
    {
        return $this->reason === 'TIER_INSUFFICIENT';
    }
    
    /**
     * Check if validation failed due to missing features
     * 
     * @return bool
     */
    public function hasMissingFeatures(): bool
    {
        return $this->reason === 'FEATURES_INSUFFICIENT';
    }
    
    /**
     * Check if license is expired
     * 
     * @return bool
     */
    public function isExpired(): bool
    {
        return $this->reason === 'EXPIRED';
    }
    
    /**
     * Check if license is revoked
     * 
     * @return bool
     */
    public function isRevoked(): bool
    {
        return $this->reason === 'REVOKED';
    }
    
    /**
     * {@inheritdoc}
     */
    public function getUserMessage(): string
    {
        // Provide user-friendly messages based on reason
        return match ($this->reason) {
            'EXPIRED' => 'Your license has expired. Please renew to continue using this software.',
            'REVOKED' => 'Your license has been revoked. Please contact support.',
            'TIER_INSUFFICIENT' => "This feature requires an upgrade to {$this->requiredTier} tier.",
            'FEATURES_INSUFFICIENT' => 'This feature is not included in your current license plan.',
            'DEVICE_MISMATCH' => 'This license is registered to a different device.',
            'NOT_FOUND' => 'License key not found. Please check your license key.',
            'INVALID_FORMAT' => 'Invalid license key format. Please check your license key.',
            default => $this->getMessage(),
        };
    }
    
    /**
     * {@inheritdoc}
     */
    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'reason' => $this->reason,
            'currentTier' => $this->currentTier,
            'requiredTier' => $this->requiredTier,
            'missingFeatures' => $this->missingFeatures,
        ]);
    }
}