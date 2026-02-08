<?php

declare(strict_types=1);

namespace UniversalLicense\Modules;

use UniversalLicense\Http\HttpClient;
use UniversalLicense\Config\LicenseConfig;

/**
 * Health Module
 *
 * Matches backend endpoints under /api/health
 */
class HealthModule
{
    public function __construct(
        private HttpClient $http,
        private LicenseConfig $config
    ) {}

    /**
     * GET /api/health
     */
    public function getHealth(): array
    {
        return $this->http->get('/health', [], false)->toArray();
    }

    /**
     * GET /api/health/database (admin)
     */
    public function getDatabaseHealth(): array
    {
        return $this->http->get('/health/database', [], false)->toArray();
    }

    /**
     * POST /api/health/check (admin)
     */
    public function check(): array
    {
        return $this->http->post('/health/check')->toArray();
    }

    /**
     * GET /api/health/email-status (admin)
     */
    public function getEmailStatus(): array
    {
        return $this->http->get('/health/email-status', [], false)->toArray();
    }
}
