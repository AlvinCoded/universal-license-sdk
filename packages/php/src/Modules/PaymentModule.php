<?php

declare(strict_types=1);

namespace UniversalLicense\Modules;

use UniversalLicense\Http\HttpClient;
use UniversalLicense\Config\LicenseConfig;

/**
 * Payment Module
 *
 * Matches backend endpoints under /api/payment
 */
class PaymentModule
{
    public function __construct(
        private HttpClient $http,
        private LicenseConfig $config
    ) {}

    /**
     * POST /api/payment/create-subscription
     * @param array<string, mixed> $data
     */
    public function createSubscription(array $data, ?string $idempotencyKey = null): array
    {
        $options = [];
        if ($idempotencyKey) {
            $options['headers'] = ['Idempotency-Key' => $idempotencyKey];
        }

        return $this->http->post('/payment/create-subscription', $data, $options)->toArray();
    }

    /**
     * POST /api/payment/create-payment-intent
     * @param array<string, mixed> $data
     */
    public function createPaymentIntent(array $data, ?string $idempotencyKey = null): array
    {
        $options = [];
        if ($idempotencyKey) {
            $options['headers'] = ['Idempotency-Key' => $idempotencyKey];
        }

        return $this->http->post('/payment/create-payment-intent', $data, $options)->toArray();
    }

    /**
     * POST /api/payment/check-trial-eligibility
     * @param array<string, mixed> $data
     */
    public function checkTrialEligibility(array $data): array
    {
        return $this->http->post('/payment/check-trial-eligibility', $data)->toArray();
    }

    /**
     * POST /api/payment/cancel-subscription
     * @param array<string, mixed> $data
     */
    public function cancelSubscription(array $data): array
    {
        return $this->http->post('/payment/cancel-subscription', $data)->toArray();
    }

    /**
     * POST /api/payment/create-portal-session
     * @param array<string, mixed> $data
     */
    public function createPortalSession(array $data): array
    {
        return $this->http->post('/payment/create-portal-session', $data)->toArray();
    }

    /**
     * POST /api/payment/webhook
     *
     * NOTE: Typically called by Stripe, not by application code.
     * @param array<string, mixed> $data
     */
    public function webhook(array $data): array
    {
        return $this->http->post('/payment/webhook', $data)->toArray();
    }

    /**
     * GET /api/payment/trial-stats
     */
    public function getTrialStats(): array
    {
        return $this->http->get('/payment/trial-stats')->toArray();
    }

    /**
     * GET /api/payment/subscription/:subscriptionId
     */
    public function getSubscription(string $subscriptionId): array
    {
        return $this->http->get("/payment/subscription/{$subscriptionId}")->toArray();
    }
}
