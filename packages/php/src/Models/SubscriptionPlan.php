<?php

declare(strict_types=1);

namespace UniversalLicense\Models;

/**
 * Subscription Plan Model
 * 
 * Represents a subscription plan for a product.
 * 
 * @package UniversalLicense\Models
 */
class SubscriptionPlan
{
    public int $id;
    public int $productId;
    public string $planCode;
    public string $planName;
    public string $tier; // 'standard' | 'pro' | 'enterprise'
    public int $durationDays;
    public float $priceAmount;
    public string $priceCurrency;
    public ?int $maxUsers;
    public array $features;
    public bool $isActive;
    public \DateTime $createdAt;
    public \DateTime $updatedAt;
    
    // Joined fields
    public ?string $productName;
    public ?string $productCode;
    
    /**
     * Create SubscriptionPlan instance from API response array
     * 
     * @param array<string, mixed> $data API response data
     * @return self
     */
    public static function fromArray(array $data): self
    {
        $plan = new self();
        
        $plan->id = (int) ($data['id'] ?? 0);
        $plan->productId = (int) ($data['product_id'] ?? $data['productId'] ?? 0);
        $plan->planCode = (string) ($data['plan_code'] ?? $data['planCode'] ?? '');
        $plan->planName = (string) ($data['plan_name'] ?? $data['planName'] ?? '');
        $plan->tier = (string) ($data['tier'] ?? 'standard');
        $plan->durationDays = (int) ($data['duration_days'] ?? $data['durationDays'] ?? 365);
        $plan->priceAmount = (float) ($data['price_amount'] ?? $data['priceAmount'] ?? 0);
        $plan->priceCurrency = (string) ($data['price_currency'] ?? $data['priceCurrency'] ?? 'USD');
        $plan->maxUsers = isset($data['max_users']) || isset($data['maxUsers']) 
            ? (int) ($data['max_users'] ?? $data['maxUsers']) 
            : null;
        
        // Parse features
        $features = $data['features'] ?? [];
        $plan->features = is_string($features) ? json_decode($features, true) : (array) $features;
        
        $plan->isActive = (bool) ($data['is_active'] ?? $data['isActive'] ?? true);
        $plan->createdAt = new \DateTime($data['created_at'] ?? $data['createdAt'] ?? 'now');
        $plan->updatedAt = new \DateTime($data['updated_at'] ?? $data['updatedAt'] ?? 'now');
        
        // Joined fields
        $plan->productName = isset($data['product_name']) || isset($data['productName']) 
            ? (string) ($data['product_name'] ?? $data['productName']) 
            : null;
        $plan->productCode = isset($data['product_code']) || isset($data['productCode']) 
            ? (string) ($data['product_code'] ?? $data['productCode']) 
            : null;
        
        return $plan;
    }
    
    /**
     * Convert SubscriptionPlan to array
     * 
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'productId' => $this->productId,
            'planCode' => $this->planCode,
            'planName' => $this->planName,
            'tier' => $this->tier,
            'durationDays' => $this->durationDays,
            'priceAmount' => $this->priceAmount,
            'priceCurrency' => $this->priceCurrency,
            'maxUsers' => $this->maxUsers,
            'features' => $this->features,
            'isActive' => $this->isActive,
            'createdAt' => $this->createdAt->format('c'),
            'updatedAt' => $this->updatedAt->format('c'),
            'productName' => $this->productName,
            'productCode' => $this->productCode,
        ];
    }
    
    /**
     * Get formatted price string
     * 
     * @return string Example: "£599.99 GBP"
     */
    public function getFormattedPrice(): string
    {
        $symbol = $this->getCurrencySymbol();
        return sprintf('%s%.2f %s', $symbol, $this->priceAmount, $this->priceCurrency);
    }
    
    /**
     * Get currency symbol
     * 
     * @return string
     */
    private function getCurrencySymbol(): string
    {
        $symbols = [
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'JPY' => '¥',
        ];
        
        return $symbols[$this->priceCurrency] ?? '';
    }
    
    /**
     * Check if plan has specific feature
     * 
     * @param string $featureName Feature name
     * @return bool
     */
    public function hasFeature(string $featureName): bool
    {
        return $this->features[$featureName] ?? false;
    }
    
    /**
     * Get duration in months (approximate)
     * 
     * @return int
     */
    public function getDurationInMonths(): int
    {
        return (int) round($this->durationDays / 30);
    }
    
    /**
     * Get duration in years (approximate)
     * 
     * @return float
     */
    public function getDurationInYears(): float
    {
        return round($this->durationDays / 365, 1);
    }
}