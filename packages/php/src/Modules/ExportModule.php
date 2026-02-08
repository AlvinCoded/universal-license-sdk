<?php

declare(strict_types=1);

namespace UniversalLicense\Modules;

use UniversalLicense\Http\HttpClient;
use UniversalLicense\Config\LicenseConfig;
use UniversalLicense\Http\RawResponse;

/**
 * Export Module (admin)
 *
 * Matches backend endpoints under /api/export
 */
class ExportModule
{
    public function __construct(
        private HttpClient $http,
        private LicenseConfig $config
    ) {}

    /**
     * GET /api/export/licenses/:format
     *
     * @param string $format csv|json|xlsx
     */
    public function exportLicenses(string $format = 'csv'): RawResponse
    {
        return $this->http->getRaw("/export/licenses/{$format}");
    }

    /**
     * GET /api/export/purchases/:format
     *
     * @param string $format csv|json|xlsx
     */
    public function exportPurchases(string $format = 'csv'): RawResponse
    {
        return $this->http->getRaw("/export/purchases/{$format}");
    }
}
