<?php

declare(strict_types=1);

namespace UniversalLicense\Models;

/**
 * License Model
 * 
 * Represents a software license with all its properties.
 * 
 * @package UniversalLicense\Models
 */
class License
{
    public int $id;
    public string $licenseKey;
    public int $productId;
    public int $planId;
    public int $organizationId;
    public ?string $deviceIdHash;
    public string $status; // 'pending' | 'active' | 'expired' | 'revoked' | 'suspended'
    public string $tier; // 'standard' | 'pro' | 'enterprise'
    public ?int $maxUsers;
    public array $features;
    public \DateTime $issuedAt;
    public \DateTime $expiresAt;
    public ?\DateTime $activatedAt;
    public ?\DateTime $lastValidatedAt;
    public ?\DateTime $revokedAt;
    public ?string $revokeReason;
    public ?string $purchaseReference;
    public bool $renewalEnabled;
    public bool $autoRenew;
    public int $renewalCount;
    public ?\DateTime $lastRenewalDate;
    public ?\DateTime $nextRenewalDate;
    public ?float $priceAmount;
    public ?string $priceCurrency;
    public \DateTime $createdAt;
    public \DateTime $updatedAt;
    
    // Joined fields from related tables
    public ?string $productName;
    public ?string $productCode;
    public ?string $planName;
    public ?string $planCode;
    public ?string $orgName;
    public ?string $ownerName;
    public ?string $ownerEmail;
    
    /**
     * Create License instance from API response array
     * 
     * @param array<string, mixed> $data API response data
     * @return self
     */
    public static function fromArray(array $data): self
    {
        $license = new self();
        
        $license->id = (int) ($data['id'] ?? 0);
        $license->licenseKey = (string) ($data['license_key'] ?? $data['licenseKey'] ?? '');
        $license->productId = (int) ($data['product_id'] ?? $data['productId'] ?? 0);
        $license->planId = (int) ($data['plan_id'] ?? $data['planId'] ?? 0);
        $license->organizationId = (int) ($data['organization_id'] ?? $data['organizationId'] ?? 0);
        $license->deviceIdHash = isset($data['device_id_hash']) || isset($data['deviceIdHash']) 
            ? (string) ($data['device_id_hash'] ?? $data['deviceIdHash']) 
            : null;
        
        $license->status = (string) ($data['status'] ?? 'pending');
        $license->tier = (string) ($data['tier'] ?? 'standard');
        $license->maxUsers = isset($data['max_users']) || isset($data['maxUsers']) 
            ? (int) ($data['max_users'] ?? $data['maxUsers']) 
            : null;
        
        // Parse features (can be JSON string or array)
        $features = $data['features'] ?? [];
        $license->features = is_string($features) ? json_decode($features, true) : (array) $features;
        
        // Parse dates
        $license->issuedAt = self::parseDate($data['issued_at'] ?? $data['issuedAt'] ?? 'now');
        $license->expiresAt = self::parseDate($data['expires_at'] ?? $data['expiresAt'] ?? 'now');
        $license->activatedAt = self::parseDateOptional($data['activated_at'] ?? $data['activatedAt'] ?? null);
        $license->lastValidatedAt = self::parseDateOptional($data['last_validated_at'] ?? $data['lastValidatedAt'] ?? null);
        $license->revokedAt = self::parseDateOptional($data['revoked_at'] ?? $data['revokedAt'] ?? null);
        $license->lastRenewalDate = self::parseDateOptional($data['last_renewal_date'] ?? $data['lastRenewalDate'] ?? null);
        $license->nextRenewalDate = self::parseDateOptional($data['next_renewal_date'] ?? $data['nextRenewalDate'] ?? null);
        $license->createdAt = self::parseDate($data['created_at'] ?? $data['createdAt'] ?? 'now');
        $license->updatedAt = self::parseDate($data['updated_at'] ?? $data['updatedAt'] ?? 'now');
        
        $license->revokeReason = isset($data['revoke_reason']) || isset($data['revokeReason']) 
            ? (string) ($data['revoke_reason'] ?? $data['revokeReason']) 
            : null;
        $license->purchaseReference = isset($data['purchase_reference']) || isset($data['purchaseReference']) 
            ? (string) ($data['purchase_reference'] ?? $data['purchaseReference']) 
            : null;
        
        $license->renewalEnabled = (bool) ($data['renewal_enabled'] ?? $data['renewalEnabled'] ?? true);
        $license->autoRenew = (bool) ($data['auto_renew'] ?? $data['autoRenew'] ?? false);
        $license->renewalCount = (int) ($data['renewal_count'] ?? $data['renewalCount'] ?? 0);
        
        $license->priceAmount = isset($data['price_amount']) || isset($data['priceAmount']) 
            ? (float) ($data['price_amount'] ?? $data['priceAmount']) 
            : null;
        $license->priceCurrency = isset($data['price_currency']) || isset($data['priceCurrency']) 
            ? (string) ($data['price_currency'] ?? $data['priceCurrency']) 
            : null;
        
        // Joined fields
        $license->productName = isset($data['product_name']) || isset($data['productName']) 
            ? (string) ($data['product_name'] ?? $data['productName']) 
            : null;
        $license->productCode = isset($data['product_code']) || isset($data['productCode']) 
            ? (string) ($data['product_code'] ?? $data['productCode']) 
            : null;
        $license->planName = isset($data['plan_name']) || isset($data['planName']) 
            ? (string) ($data['plan_name'] ?? $data['planName']) 
            : null;
        $license->planCode = isset($data['plan_code']) || isset($data['planCode']) 
            ? (string) ($data['plan_code'] ?? $data['planCode']) 
            : null;
        $license->orgName = isset($data['org_name']) || isset($data['orgName']) 
            ? (string) ($data['org_name'] ?? $data['orgName']) 
            : null;
        $license->ownerName = isset($data['owner_name']) || isset($data['ownerName']) 
            ? (string) ($data['owner_name'] ?? $data['ownerName']) 
            : null;
        $license->ownerEmail = isset($data['owner_email']) || isset($data['ownerEmail']) 
            ? (string) ($data['owner_email'] ?? $data['ownerEmail']) 
            : null;
        
        return $license;
    }
    
    /**
     * Convert License to array
     * 
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'licenseKey' => $this->licenseKey,
            'productId' => $this->productId,
            'planId' => $this->planId,
            'organizationId' => $this->organizationId,
            'deviceIdHash' => $this->deviceIdHash,
            'status' => $this->status,
            'tier' => $this->tier,
            'maxUsers' => $this->maxUsers,
            'features' => $this->features,
            'issuedAt' => $this->issuedAt->format('c'),
            'expiresAt' => $this->expiresAt->format('c'),
            'activatedAt' => $this->activatedAt?->format('c'),
            'lastValidatedAt' => $this->lastValidatedAt?->format('c'),
            'revokedAt' => $this->revokedAt?->format('c'),
            'revokeReason' => $this->revokeReason,
            'purchaseReference' => $this->purchaseReference,
            'renewalEnabled' => $this->renewalEnabled,
            'autoRenew' => $this->autoRenew,
            'renewalCount' => $this->renewalCount,
            'lastRenewalDate' => $this->lastRenewalDate?->format('c'),
            'nextRenewalDate' => $this->nextRenewalDate?->format('c'),
            'priceAmount' => $this->priceAmount,
            'priceCurrency' => $this->priceCurrency,
            'createdAt' => $this->createdAt->format('c'),
            'updatedAt' => $this->updatedAt->format('c'),
            'productName' => $this->productName,
            'productCode' => $this->productCode,
            'planName' => $this->planName,
            'planCode' => $this->planCode,
            'orgName' => $this->orgName,
            'ownerName' => $this->ownerName,
            'ownerEmail' => $this->ownerEmail,
        ];
    }
    
    /**
     * Check if license is active
     * 
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
    
    /**
     * Check if license is expired
     * 
     * @return bool
     */
    public function isExpired(): bool
    {
        return $this->expiresAt < new \DateTime();
    }
    
    /**
     * Check if license is revoked
     * 
     * @return bool
     */
    public function isRevoked(): bool
    {
        return $this->status === 'revoked';
    }
    
    /**
     * Get days until expiration (negative if expired)
     * 
     * @return int
     */
    public function daysUntilExpiry(): int
    {
        $now = new \DateTime();
        $interval = $now->diff($this->expiresAt);
        return (int) $interval->format('%r%a');
    }
    
    /**
     * Check if license has specific feature enabled
     * 
     * @param string $featureName Feature name
     * @return bool
     */
    public function hasFeature(string $featureName): bool
    {
        return $this->features[$featureName] ?? false;
    }
    
    /**
     * Parse date string to DateTime
     * 
     * @param string $date Date string
     * @return \DateTime
     */
    private static function parseDate(string $date): \DateTime
    {
        return new \DateTime($date);
    }
    
    /**
     * Parse optional date string to DateTime or null
     * 
     * @param string|null $date Date string or null
     * @return \DateTime|null
     */
    private static function parseDateOptional(?string $date): ?\DateTime
    {
        return $date ? new \DateTime($date) : null;
    }
}