<?php

declare(strict_types=1);

namespace UniversalLicense\Modules;

use UniversalLicense\Http\HttpClient;
use UniversalLicense\Config\LicenseConfig;

/**
 * Import Module (admin)
 *
 * Matches backend endpoints under /api/import
 */
class ImportModule
{
    public function __construct(
        private HttpClient $http,
        private LicenseConfig $config
    ) {}

    /**
     * POST /api/import/:dataType/validate
     *
     * @param string $dataType e.g. "licenses" | "purchases" | ... (backend-defined)
     * @param array<string, mixed> $payload
     */
    public function validate(string $dataType, array $payload): array
    {
        return $this->http->post("/import/{$dataType}/validate", $payload)->toArray();
    }

    /**
     * POST /api/import/:dataType/preview
     *
     * @param array<string, mixed> $payload
     */
    public function preview(string $dataType, array $payload): array
    {
        return $this->http->post("/import/{$dataType}/preview", $payload)->toArray();
    }

    /**
     * POST /api/import/:dataType
     *
     * @param array<string, mixed> $payload
     */
    public function import(string $dataType, array $payload): array
    {
        return $this->http->post("/import/{$dataType}", $payload)->toArray();
    }
}
