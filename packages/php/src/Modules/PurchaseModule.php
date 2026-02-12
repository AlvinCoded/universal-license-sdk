<?php

declare(strict_types=1);

namespace UniversalLicense\Modules;

use UniversalLicense\Http\HttpClient;
use UniversalLicense\Config\LicenseConfig;
use UniversalLicense\Exceptions\ApiException;

/**
 * Purchase Module
 * 
 * Handles purchase order and subscription operations.
 * 
 * @package UniversalLicense\Modules
 */
class PurchaseModule
{
    public function __construct(
        private HttpClient $http,
        private LicenseConfig $config
    ) {}
    
    /**
     * Create a purchase order
     * 
     * Creates a new purchase order for a subscription plan.
     * This initiates the purchase flow before payment.
     * 
     * @param array{
     *   planCode: string,
     *   organizationData: array{
     *     orgName: string,
     *     ownerName: string,
     *     ownerEmail: string,
     *     orgType?: string,
     *     address?: string,
     *     phone?: string,
     *     country?: string
     *   },
     *   paymentMethod?: string,
     *   metadata?: array
     * } $data Purchase order data
     * @return array{
     *   order: array{
     *     orderId: string,
     *     amount: float,
     *     currency: string,
     *     planName: string,
     *     tier: string,
     *     durationDays: int,
     *     paymentStatus: string
     *   },
     *   organization: array{
     *     orgCode: string,
     *     orgName: string
     *   }
     * }
     * 
     * @example
     * ```php
     * // Step 1: Create purchase order
     * $order = $client->purchases->createOrder([
    *     'planCode' => 'PROD-PRO',
     *     'organizationData' => [
    *         'orgName' => 'Example Organization',
    *         'ownerName' => 'Jane Doe',
    *         'ownerEmail' => 'owner@example.com',
    *         'orgType' => 'Company',
    *         'address' => '123 Example St, City, State 12345',
     *         'phone' => '+1-555-123-4567',
     *         'country' => 'USA'
     *     ],
     *     'paymentMethod' => 'stripe',
     *     'metadata' => [
     *         'source' => 'website',
     *         'campaign' => 'spring2025'
     *     ]
     * ]);
     * 
     * // Get order details
     * $orderId = $order['order']['orderId'];
     * $amount = $order['order']['amount'];
     * $currency = $order['order']['currency'];
     * 
     * echo "Order ID: {$orderId}\n";
     * echo "Amount: \${$amount} {$currency}\n";
     * 
     * // Step 2: Process payment with your payment gateway
     * // ...
     * 
     * // Step 3: Complete order (see completePurchase())
     * ```
     */
    public function createOrder(array $data, ?string $idempotencyKey = null): array
    {
        $options = [];
        if ($idempotencyKey) {
            $options['headers'] = ['Idempotency-Key' => $idempotencyKey];
        }

        $response = $this->http->post('/purchases/create-order', $data, $options);
        return $response->toArray();
    }
    
    /**
     * Complete a purchase after payment
     * 
     * Completes the purchase flow and generates the license.
     * Call this after successful payment processing.
     * 
     * @param string $orderId Order ID from createOrder()
     * @param string $paymentReference Payment transaction reference/ID
     * @return array{
     *   success: bool,
     *   license: array{
     *     licenseKey: string,
     *     tier: string,
     *     expiresAt: string,
     *     features: array,
     *     maxUsers: int|null
     *   },
     *   organization: array{
     *     orgName: string,
     *     orgCode: string
     *   }
     * }
     * 
     * @example
     * ```php
     * // After successful Stripe payment
     * $paymentIntent = \Stripe\PaymentIntent::retrieve($paymentIntentId);
     * 
     * if ($paymentIntent->status === 'succeeded') {
     *     // Complete the purchase
     *     $result = $client->purchases->completePurchase(
     *         $orderId,
     *         $paymentIntent->id
     *     );
     *     
     *     if ($result['success']) {
     *         $licenseKey = $result['license']['licenseKey'];
     *         $tier = $result['license']['tier'];
     *         $expiresAt = $result['license']['expiresAt'];
     *         
     *         echo "License generated: {$licenseKey}\n";
     *         echo "Tier: {$tier}\n";
     *         echo "Expires: {$expiresAt}\n";
     *         
     *         // Send license key to customer via email
     *         // Store license in your database
     *     }
     * }
     * ```
     */
    public function completePurchase(string $orderId, string $paymentReference, ?string $idempotencyKey = null): array
    {
        $options = [];
        if ($idempotencyKey) {
            $options['headers'] = ['Idempotency-Key' => $idempotencyKey];
        }

        $response = $this->http->post('/purchases/complete-purchase', [
            'orderId' => $orderId,
            'paymentReference' => $paymentReference
        ], $options);
        
        return $response->toArray();
    }
    
    /**
     * Get purchase order details
     * 
     * Retrieves order information and status.
     * 
     * @param string $orderId Order ID
     * @return array Order details
     * 
     * @example
     * ```php
     * $order = $client->purchases->getOrder('ORDER-1234567890-ABCDEFGHI');
     * 
     * echo "Status: {$order['payment_status']}\n";
     * echo "Amount: \${$order['amount']}\n";
     * 
     * if ($order['license_id']) {
     *     echo "License generated: {$order['license_key']}\n";
     * }
     * ```
     */
    public function getOrder(string $orderId): array
    {
        $response = $this->http->get("/purchases/order/{$orderId}");
        return $response->toArray();
    }
    
    /**
     * Get all purchase orders (admin only)
     * 
     * Retrieves list of all purchase orders with filters.
     * 
     * @param array{
     *   status?: string,
     *   limit?: int,
     *   offset?: int
     * } $filters Optional filters
     * @return array Purchase orders list
     * 
     * @example
     * ```php
     * // Get all completed purchases
     * $purchases = $client->purchases->getAll([
     *     'status' => 'completed',
     *     'limit' => 50
     * ]);
     * 
     * foreach ($purchases as $purchase) {
     *     echo "{$purchase['order_id']} - {$purchase['org_name']}\n";
     *     echo "  Amount: \${$purchase['amount']}\n";
     *     echo "  Status: {$purchase['payment_status']}\n";
     * }
     * ```
     */
    public function getAll(array $filters = []): array
    {
        $response = $this->http->get('/purchases', $filters);
        return $response->get('purchases', []);
    }
    
    /**
     * Get available plans for a product
     * 
     * Retrieves subscription plans for purchase flow.
     * 
     * @param string $productCode Product code
     * @return array Available plans
     * 
     * @example
     * ```php
    * $plans = $client->purchases->getAvailablePlans('PROD');
     * 
     * foreach ($plans as $plan) {
     *     echo "{$plan['plan_name']} - \${$plan['price_amount']}\n";
     *     echo "  Features: " . implode(', ', array_keys($plan['features'])) . "\n";
     * }
     * ```
     */
    public function getAvailablePlans(string $productCode): array
    {
        $safeProductCode = rawurlencode($productCode);
        $response = $this->http->get("/purchases/plans/{$safeProductCode}");
        return $response->get('plans', []);
    }

    /**
     * Start a trial (no payment)
     *
     * Starts a time-limited trial license for an eligible organization.
     *
     * @param array{
     *   planCode: string,
     *   organizationData: array{
     *     orgName: string,
     *     ownerName: string,
     *     ownerEmail: string,
     *     orgType?: string,
     *     address?: string,
     *     phone?: string,
     *     country?: string
     *   },
     *   metadata?: array
     * } $data
     *
     * @return array{
     *   started: bool,
     *   eligible: bool,
     *   reason?: string,
     *   trialDays?: int,
     *   trialEnd?: string,
     *   organization?: array,
     *   license?: array
     * }
     */
    public function startTrial(array $data, ?string $idempotencyKey = null): array
    {
        $options = [];
        if ($idempotencyKey) {
            $options['headers'] = ['Idempotency-Key' => $idempotencyKey];
        }

        $response = $this->http->post('/purchases/start-trial', $data, $options);
        return $response->toArray();
    }
}