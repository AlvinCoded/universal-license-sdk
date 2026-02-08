<?php

declare(strict_types=1);

namespace UniversalLicense\Modules;

use UniversalLicense\Http\HttpClient;
use UniversalLicense\Config\LicenseConfig;

/**
 * Renewal Module
 *
 * Matches backend endpoints under /api/renewal and manual renew under /api/licenses/:licenseKey/renew.
 */
class RenewalModule
{
    public function __construct(
        private HttpClient $http,
        private LicenseConfig $config
    ) {}

    /**
     * POST /api/renewal/request-magic-link
     * @param array<string, mixed> $data
     */
    public function requestMagicLink(array $data): array
    {
        return $this->http->post('/renewal/request-magic-link', $data)->toArray();
    }

    /**
     * GET /api/renewal/verify-token/:token
     */
    public function verifyToken(string $token): array
    {
        return $this->http->get("/renewal/verify-token/{$token}", [], false)->toArray();
    }

    /**
     * POST /api/renewal/process
     * @param array<string, mixed> $data
     */
    public function process(array $data): array
    {
        return $this->http->post('/renewal/process', $data)->toArray();
    }

    /**
     * POST /api/licenses/:licenseKey/renew (admin/manual)
     * @param array<string, mixed> $data
     */
    public function renewLicense(string $licenseKey, array $data = []): array
    {
        return $this->http->post("/licenses/{$licenseKey}/renew", $data)->toArray();
    }
}
