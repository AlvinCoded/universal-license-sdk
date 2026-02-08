<?php

declare(strict_types=1);

namespace UniversalLicense\Modules;

use UniversalLicense\Http\HttpClient;
use UniversalLicense\Config\LicenseConfig;
use UniversalLicense\Models\Product;
use UniversalLicense\Models\SubscriptionPlan;

/**
 * Product Module
 * 
 * Handles product and subscription plan operations.
 * 
 * @package UniversalLicense\Modules
 */
class ProductModule
{
    public function __construct(
        private HttpClient $http,
        private LicenseConfig $config
    ) {}
    
    /**
     * Get all products
     * 
     * Retrieves list of all products with their plans.
     * 
     * @return array<Product>
     * 
     * @example
     * ```php
     * $products = $client->products->getAll();
     * 
     * foreach ($products as $product) {
     *     echo "{$product->productName} ({$product->productCode})\n";
     *     echo "  Description: {$product->description}\n";
     * }
     * ```
     */
    public function getAll(): array
    {
        $response = $this->http->get('/products');
        $data = $response->toArray();
        
        return array_map(
            fn($item) => Product::fromArray($item),
            $data['products'] ?? []
        );
    }
    
    /**
     * Get product by code
     * 
     * Retrieves detailed product information including plans.
     * 
    * @param string $productCode Product code (e.g., 'PROD')
     * @return Product
     * 
     * @example
     * ```php
    * $product = $client->products->get('PROD');
    * echo $product->productName;
     * ```
     */
    public function get(string $productCode): Product
    {
        $response = $this->http->get("/products/{$productCode}");
        return Product::fromArray($response->toArray());
    }
    
    /**
     * Get subscription plans for a product
     * 
     * Retrieves all available plans for a specific product.
     * 
     * @param string $productCode Product code
     * @return array<SubscriptionPlan>
     * 
     * @example
     * ```php
    * $plans = $client->products->getPlans('PROD');
     * 
     * foreach ($plans as $plan) {
     *     echo "{$plan->planName} - \${$plan->priceAmount} {$plan->priceCurrency}\n";
     *     echo "  Tier: {$plan->tier}\n";
     *     echo "  Duration: {$plan->durationDays} days\n";
     *     echo "  Max Users: " . ($plan->maxUsers ?? 'unlimited') . "\n";
     * }
     * ```
     */
    public function getPlans(string $productCode): array
    {
        $response = $this->http->get("/products/{$productCode}/plans");
        $data = $response->toArray();
        
        return array_map(
            fn($item) => SubscriptionPlan::fromArray($item),
            $data['plans'] ?? []
        );
    }
    
    /**
     * Get specific plan by code
     * 
     * Retrieves detailed plan information.
     * 
    * @param string $planCode Plan code (e.g., 'PROD-PRO')
     * @return SubscriptionPlan
     * 
     * @example
     * ```php
    * $plan = $client->products->getPlan('PROD-PRO');
     * 
     * echo "Plan: {$plan->planName}\n";
     * echo "Price: \${$plan->priceAmount}\n";
     * echo "Features:\n";
     * foreach ($plan->features as $feature => $enabled) {
     *     echo "  - {$feature}: " . ($enabled ? 'Yes' : 'No') . "\n";
     * }
     * ```
     */
    public function getPlan(string $planCode): SubscriptionPlan
    {
        $response = $this->http->get("/plans/{$planCode}");
        return SubscriptionPlan::fromArray($response->toArray());
    }
    
    /**
     * Create a new product (admin only)
     * 
     * Creates a new product in the system.
     * 
     * @param array{
     *   productCode: string,
     *   productName: string,
     *   description?: string
     * } $data Product data
     * @return Product Created product
     * 
     * @example
     * ```php
     * $product = $client->products->create([
     *     'productCode' => 'REST-POS',
     *     'productName' => 'Restaurant POS System',
     *     'description' => 'Complete point-of-sale solution for restaurants'
     * ]);
     * ```
     */
    public function create(array $data): Product
    {
        $response = $this->http->post('/products/create', $data);
        return Product::fromArray($response->toArray());
    }
    
    /**
     * Create a new subscription plan (admin only)
     * 
     * Creates a new plan for an existing product.
     * 
     * @param array{
     *   productId: int,
     *   planCode: string,
     *   planName: string,
     *   tier: string,
     *   durationDays: int,
     *   priceAmount: float,
     *   priceCurrency: string,
     *   maxUsers?: int,
     *   features?: array
     * } $data Plan data
     * @return SubscriptionPlan Created plan
     * 
     * @example
     * ```php
     * $plan = $client->products->createPlan([
     *     'productId' => 1,
     *     'planCode' => 'REST-POS-PRO',
     *     'planName' => 'Pro Plan',
     *     'tier' => 'pro',
     *     'durationDays' => 365,
     *     'priceAmount' => 599.99,
     *     'priceCurrency' => 'USD',
     *     'maxUsers' => 50,
     *     'features' => [
     *         'pos' => true,
     *         'inventory' => true,
     *         'reporting' => true,
     *         'multiLocation' => true
     *     ]
     * ]);
     * ```
     */
    public function createPlan(array $data): SubscriptionPlan
    {
        $response = $this->http->post('/products/plans/create', $data);
        return SubscriptionPlan::fromArray($response->toArray());
    }
    
    /**
     * Delete a product (admin only)
     * 
     * Permanently deletes a product and all associated plans.
     * 
     * @param int $productId Product ID
     * @return void
     */
    public function deleteProduct(int $productId): void
    {
        $this->http->delete("/products/{$productId}");
    }
    
    /**
     * Delete a subscription plan (admin only)
     * 
     * Permanently deletes a subscription plan.
     * 
     * @param int $planId Plan ID
     * @return void
     */
    public function deletePlan(int $planId): void
    {
        $this->http->delete("/products/plans/{$planId}");
    }
}