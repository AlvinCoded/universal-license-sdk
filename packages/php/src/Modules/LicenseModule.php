<?php

declare(strict_types=1);

namespace UniversalLicense\Modules;

use UniversalLicense\Http\HttpClient;
use UniversalLicense\Config\LicenseConfig;
use UniversalLicense\Models\License;
use UniversalLicense\Exceptions\ApiException;

/**
 * License Module
 * 
 * Handles license management operations (admin operations).
 * 
 * @package UniversalLicense\Modules
 */
class LicenseModule
{
    public function __construct(
        private HttpClient $http,
        private LicenseConfig $config
    ) {}
    
    /**
     * Get all licenses with optional filters
     * 
     * Requires authentication token.
     * 
     * @param array{
     *   status?: string,
     *   tier?: string,
     *   productCode?: string,
     *   organizationId?: int,
     *   search?: string
     * } $filters Optional filters
     * @return array<License>
     * 
     * @example
     * ```php
     * // Get all active pro licenses
     * $licenses = $client->licenses->getAll([
     *     'status' => 'active',
     *     'tier' => 'pro'
     * ]);
     * 
     * foreach ($licenses as $license) {
     *     echo "{$license->licenseKey} - {$license->orgName}\n";
     * }
     * ```
     */
    public function getAll(array $filters = []): array
    {
        $response = $this->http->get('/licenses', $filters);
        $data = $response->toArray();
        
        return array_map(
            fn($item) => License::fromArray($item),
            $data['licenses'] ?? []
        );
    }
    
    /**
     * Get license by key
     * 
     * Retrieves detailed license information.
     * 
     * @param string $licenseKey License key
     * @return License
     * @throws ApiException If license not found
     * 
     * @example
     * ```php
    * $license = $client->licenses->get('PROD-ORG-2025-XXXX-XXXX-XXXX');
     * echo "Expires: " . $license->expiresAt->format('Y-m-d');
     * echo "Status: " . $license->status;
     * ```
     */
    public function get(string $licenseKey): License
    {
        $response = $this->http->get("/licenses/{$licenseKey}");
        return License::fromArray($response->toArray());
    }

    /**
     * Get cached license object (convenience)
     *
     * Reads the validation cache and returns the cached License if available.
     *
     * @param string $licenseKey
     * @param string|null $deviceId
     * @return License|null
     *
     * @example
     * ```php
     * $cached = $client->licenses->getCached('LIC-...');
     * if ($cached) {
     *     echo $cached->licenseKey;
     * }
     * ```
     */
    public function getCached(string $licenseKey, ?string $deviceId = null): ?License
    {
        $deviceId = $deviceId ?? (string) \UniversalLicense\Validation\DeviceFingerprint::generate();
        $cacheKey = "license:validation:{$licenseKey}:{$deviceId}";

        $cached = $this->http->getFromCache($cacheKey);
        if ($cached === null) {
            return null;
        }

        if (isset($cached['license']) && is_array($cached['license'])) {
            return License::fromArray($cached['license']);
        }

        return License::fromArray((array)$cached);
    }
    
    /**
     * Generate a new license (admin only)
     * 
     * Manually generates a license for an organization.
     * 
     * @param array{
     *   planCode: string,
     *   organizationData: array{
     *     orgName: string,
     *     ownerName: string,
     *     ownerEmail?: string,
     *     orgType?: string,
     *     address?: string,
     *     phone?: string,
     *     country?: string
     *   },
     *   durationDays?: int,
     *   renewalSettings?: array,
     *   forceCreate?: bool
     * } $data License generation data
     * @return License Generated license
     * @throws ApiException
     * 
     * @example
     * ```php
     * $license = $client->licenses->generate([
    *     'planCode' => 'PROD-PRO',
     *     'organizationData' => [
    *         'orgName' => 'Example Organization',
    *         'ownerName' => 'Jane Doe',
    *         'ownerEmail' => 'owner@example.com',
    *         'orgType' => 'Company',
     *         'country' => 'USA'
     *     ],
     *     'durationDays' => 365,
     *     'renewalSettings' => [
     *         'renewalEnabled' => true,
     *         'autoRenew' => false
     *     ]
     * ]);
     * 
     * echo "Generated license: " . $license->licenseKey;
     * ```
     */
    public function generate(array $data): License
    {
        $response = $this->http->post('/licenses/generate', $data);
        return License::fromArray($response->toArray());
    }
    
    /**
     * Renew an existing license
     * 
     * Extends license expiration date.
     * 
     * @param string $licenseKey License key to renew
     * @param int|null $durationDays Extension duration (default: original plan duration)
     * @param string|null $paymentReference Payment reference/transaction ID
     * @return License Renewed license
     * 
     * @example
     * ```php
     * $renewed = $client->licenses->renew(
    *     'PROD-ORG-2025-XXXX-XXXX-XXXX',
     *     365,
     *     'payment_ref_123'
     * );
     * 
     * echo "New expiration: " . $renewed->expiresAt->format('Y-m-d');
     * ```
     */
    public function renew(
        string $licenseKey,
        ?int $durationDays = null,
        ?string $paymentReference = null
    ): License {
        $data = array_filter([
            'durationDays' => $durationDays,
            'paymentReference' => $paymentReference
        ], fn($v) => $v !== null);
        
        $response = $this->http->post("/licenses/{$licenseKey}/renew", $data);
        return License::fromArray($response->toArray());
    }
    
    /**
     * Revoke a license
     * 
     * Permanently revokes license access.
     * 
     * @param string $licenseKey License key to revoke
     * @param string $reason Revocation reason
     * @return License Revoked license
     * 
     * @example
     * ```php
    * $revoked = $client->licenses->revoke(
    *     'PROD-ORG-2025-XXXX-XXXX-XXXX',
     *     'Payment dispute'
     * );
     * 
     * echo "Status: " . $revoked->status; // "revoked"
     * ```
     */
    public function revoke(string $licenseKey, string $reason): License
    {
        $response = $this->http->post("/licenses/{$licenseKey}/revoke", [
            'reason' => $reason
        ]);
        
        return License::fromArray($response->toArray());
    }
    
    /**
     * Delete a license permanently
     * 
     * Permanently removes license from database (cannot be undone).
     * Matches backend endpoint: DELETE /api/licenses/:licenseKey
     * 
     * @param string $licenseKey License key to delete
     * @return void
     * 
     * @example
     * ```php
    * $client->licenses->delete('PROD-ORG-2025-XXXX-XXXX-XXXX');
     * echo "License deleted permanently";
     * ```
     */
    public function delete(string $licenseKey): void
    {
        $this->http->delete("/licenses/{$licenseKey}");
    }
    
    /**
     * Get license renewal history
     * 
     * Retrieves all renewal records for a license.
     * 
     * @param string $licenseKey License key
     * @return array Renewal history
     * 
     * @example
     * ```php
    * $renewals = $client->licenses->getRenewalHistory('PROD-ORG-2025-XXXX-XXXX-XXXX');
     * 
     * foreach ($renewals as $renewal) {
     *     echo "Renewed on: {$renewal['renewed_at']}\n";
     *     echo "Extended by: {$renewal['duration_days']} days\n";
     * }
     * ```
     */
    public function getRenewalHistory(string $licenseKey): array
    {
        $response = $this->http->get("/licenses/{$licenseKey}/renewals");
        return $response->get('renewals', []);
    }
    
    /**
     * Get upcoming renewals
     * 
     * Gets licenses expiring within specified days.
     * 
     * @param int $daysAhead Number of days to look ahead (default: 30)
     * @return array<License>
     * 
     * @example
     * ```php
     * // Get licenses expiring in next 90 days
     * $upcomingRenewals = $client->licenses->getUpcomingRenewals(90);
     * 
     * foreach ($upcomingRenewals as $license) {
     *     echo "{$license->licenseKey} expires on {$license->expiresAt->format('Y-m-d')}\n";
     *     // Send renewal reminder email
     * }
     * ```
     */
    public function getUpcomingRenewals(int $daysAhead = 30): array
    {
        $response = $this->http->get('/licenses/renewals/upcoming', [
            'days' => $daysAhead
        ]);
        
        return array_map(
            fn($item) => License::fromArray($item),
            $response->get('renewals', [])
        );
    }
    
    /**
     * Get license statistics (admin dashboard)
     * 
     * Retrieves dashboard statistics for admin portal.
     * 
     * @return array{
     *   total: int,
     *   active: int,
     *   pending: int,
     *   expired: int,
     *   revoked: int,
     *   suspended: int,
     *   totalRevenue: float,
     *   byTier: array,
     *   byProduct: array
     * }
     * 
     * @example
     * ```php
     * $stats = $client->licenses->getStats();
     * 
     * echo "Total licenses: {$stats['total']}\n";
     * echo "Active: {$stats['active']}\n";
     * echo "Total revenue: $" . number_format($stats['totalRevenue'], 2) . "\n";
     * echo "Standard tier: {$stats['byTier']['standard']}\n";
     * echo "Pro tier: {$stats['byTier']['pro']}\n";
     * echo "Enterprise tier: {$stats['byTier']['enterprise']}\n";
     * ```
     */
    public function getStats(): array
    {
        $response = $this->http->get('/licenses/stats/dashboard');
        return $response->toArray();
    }

    /**
     * Update renewal settings for a license
     *
     * Matches backend endpoint: PATCH /api/licenses/:licenseKey/renewal-settings
     *
     * @param string $licenseKey
     * @param array<string, mixed> $settings
     * @return array<string, mixed>
     */
    public function updateRenewalSettings(string $licenseKey, array $settings): array
    {
        $response = $this->http->patch("/licenses/{$licenseKey}/renewal-settings", $settings);
        return $response->toArray();
    }

    /**
     * Get renewal notification status for a license
     *
     * Matches backend endpoint: GET /api/licenses/:licenseKey/renewal-notifications
     *
     * @param string $licenseKey
     * @return array<string, mixed>
     */
    public function getRenewalNotifications(string $licenseKey): array
    {
        $response = $this->http->get("/licenses/{$licenseKey}/renewal-notifications");
        return $response->toArray();
    }

    /**
     * Send a test email (admin)
     *
     * Matches backend endpoint: POST /api/licenses/test-email
     *
     * @param array{email: string} $data
     * @return array<string, mixed>
     */
    public function testEmail(array $data): array
    {
        $response = $this->http->post('/licenses/test-email', $data);
        return $response->toArray();
    }
}