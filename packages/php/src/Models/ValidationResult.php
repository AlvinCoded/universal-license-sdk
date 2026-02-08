<?php

declare(strict_types=1);

namespace UniversalLicense\Models;

/**
 * Validation Result Model
 * 
 * Represents the result of a license validation operation.
 * Mirrors the validation response from backend/src/controllers/licenses.controller.ts
 * 
 * @package UniversalLicense\Models
 */
class ValidationResult
{
    public bool $valid;
    public ?License $license;
    public ?string $error;
    public ?string $reason;
    public ?string $currentTier;
    public ?string $requiredTier;
    public array $missingFeatures;
    public ?string $signature;
    
    /**
     * Create ValidationResult instance from API response array
     * 
     * @param array<string, mixed> $data API response data
     * @return self
     */
    public static function fromArray(array $data): self
    {
        $result = new self();
        
        $result->valid = (bool) ($data['valid'] ?? false);
        $result->error = isset($data['error']) ? (string) $data['error'] : null;
        $result->reason = isset($data['reason']) ? (string) $data['reason'] : null;
        $result->currentTier = isset($data['currentTier']) ? (string) $data['currentTier'] : null;
        $result->requiredTier = isset($data['requiredTier']) ? (string) $data['requiredTier'] : null;
        $result->missingFeatures = (array) ($data['missingFeatures'] ?? []);
        $result->signature = isset($data['signature']) ? (string) $data['signature'] : null;
        
        // Parse license data if present
        if (isset($data['license']) && is_array($data['license'])) {
            $result->license = License::fromArray($data['license']);
        } else {
            $result->license = null;
        }
        
        return $result;
    }
    
    /**
     * Convert ValidationResult to array
     * 
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'valid' => $this->valid,
            'license' => $this->license?->toArray(),
            'error' => $this->error,
            'reason' => $this->reason,
            'currentTier' => $this->currentTier,
            'requiredTier' => $this->requiredTier,
            'missingFeatures' => $this->missingFeatures,
            'signature' => $this->signature,
        ];
    }
    
    /**
     * Check if validation succeeded
     * 
     * @return bool
     */
    public function isValid(): bool
    {
        return $this->valid;
    }
    
    /**
     * Get validation error message
     * 
     * @return string
     */
    public function getErrorMessage(): string
    {
        if ($this->valid) {
            return '';
        }
        
        if ($this->error) {
            return $this->error;
        }
        
        // Build error message from available data
        $parts = [];
        
        if ($this->reason) {
            $parts[] = "Reason: {$this->reason}";
        }
        
        if ($this->currentTier && $this->requiredTier) {
            $parts[] = "Requires {$this->requiredTier} tier (current: {$this->currentTier})";
        }
        
        if (!empty($this->missingFeatures)) {
            $parts[] = "Missing features: " . implode(', ', $this->missingFeatures);
        }
        
        return !empty($parts) ? implode('. ', $parts) : 'License validation failed';
    }
    
    /**
     * Check if tier requirement was not met
     * 
     * @return bool
     */
    public function isTierInsufficient(): bool
    {
        return !$this->valid && $this->currentTier && $this->requiredTier;
    }
    
    /**
     * Check if features are missing
     * 
     * @return bool
     */
    public function hasMissingFeatures(): bool
    {
        return !$this->valid && !empty($this->missingFeatures);
    }
    
    /**
     * Check if license is expired
     * 
     * @return bool
     */
    public function isExpired(): bool
    {
        return !$this->valid && $this->reason === 'EXPIRED';
    }
    
    /**
     * Check if license is revoked
     * 
     * @return bool
     */
    public function isRevoked(): bool
    {
        return !$this->valid && $this->reason === 'REVOKED';
    }
}