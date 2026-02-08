<?php

declare(strict_types=1);

namespace UniversalLicense\Modules;

use UniversalLicense\Http\HttpClient;
use UniversalLicense\Config\LicenseConfig;

/**
 * Activity Module (admin)
 */
class ActivityModule
{
    public function __construct(
        private HttpClient $http,
        private LicenseConfig $config
    ) {}

    /**
     * GET /api/activity/logs
     *
     * @param array<string, mixed> $filters
     */
    public function getLogs(array $filters = []): array
    {
        return $this->http->get('/activity/logs', $filters)->toArray();
    }

    /**
     * GET /api/activity/validation/:licenseKey
     */
    public function getValidationActivity(string $licenseKey): array
    {
        return $this->http->get("/activity/validation/{$licenseKey}")->toArray();
    }
}
