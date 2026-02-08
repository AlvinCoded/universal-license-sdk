<?php

declare(strict_types=1);

namespace UniversalLicense\Models;

/**
 * Product Model
 * 
 * Represents a software product with its subscription plans.
 * 
 * @package UniversalLicense\Models
 */
class Product
{
    public int $id;
    public string $productCode;
    public string $productName;
    public ?string $description;
    public \DateTime $createdAt;
    public \DateTime $updatedAt;
    
    /** @var array<SubscriptionPlan> */
    public array $plans = [];
    
    /**
     * Create Product instance from API response array
     * 
     * @param array<string, mixed> $data API response data
     * @return self
     */
    public static function fromArray(array $data): self
    {
        $product = new self();
        
        $product->id = (int) ($data['id'] ?? 0);
        $product->productCode = (string) ($data['product_code'] ?? $data['productCode'] ?? '');
        $product->productName = (string) ($data['product_name'] ?? $data['productName'] ?? '');
        $product->description = isset($data['description']) 
            ? (string) $data['description'] 
            : null;
        
        $product->createdAt = new \DateTime($data['created_at'] ?? $data['createdAt'] ?? 'now');
        $product->updatedAt = new \DateTime($data['updated_at'] ?? $data['updatedAt'] ?? 'now');
        
        // Parse plans if included
        if (isset($data['plans']) && is_array($data['plans'])) {
            $product->plans = array_map(
                fn($planData) => SubscriptionPlan::fromArray($planData),
                $data['plans']
            );
        }
        
        return $product;
    }
    
    /**
     * Convert Product to array
     * 
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'productCode' => $this->productCode,
            'productName' => $this->productName,
            'description' => $this->description,
            'createdAt' => $this->createdAt->format('c'),
            'updatedAt' => $this->updatedAt->format('c'),
            'plans' => array_map(fn($plan) => $plan->toArray(), $this->plans),
        ];
    }
    
    /**
     * Get plan by tier
     * 
     * @param string $tier Tier name ('standard', 'pro', 'enterprise')
     * @return SubscriptionPlan|null
     */
    public function getPlanByTier(string $tier): ?SubscriptionPlan
    {
        foreach ($this->plans as $plan) {
            if ($plan->tier === $tier) {
                return $plan;
            }
        }
        return null;
    }
    
    /**
     * Get plan by code
     * 
     * @param string $planCode Plan code
     * @return SubscriptionPlan|null
     */
    public function getPlanByCode(string $planCode): ?SubscriptionPlan
    {
        foreach ($this->plans as $plan) {
            if ($plan->planCode === $planCode) {
                return $plan;
            }
        }
        return null;
    }
}