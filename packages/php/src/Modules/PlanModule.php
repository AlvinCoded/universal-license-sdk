<?php

declare(strict_types=1);

namespace UniversalLicense\Modules;

use UniversalLicense\Http\HttpClient;
use UniversalLicense\Config\LicenseConfig;

/**
 * Plan Module (admin)
 */
class PlanModule
{
    public function __construct(
        private HttpClient $http,
        private LicenseConfig $config
    ) {}

    /**
     * GET /api/plans
     */
    public function getAll(): array
    {
        return $this->http->get('/plans')->toArray();
    }

    /**
     * GET /api/plans/:planCode
     */
    public function get(string $planCode): array
    {
        return $this->http->get("/plans/{$planCode}")->toArray();
    }

    /**
     * GET /api/plans/product/:productCode
     */
    public function getByProduct(string $productCode): array
    {
        return $this->http->get("/plans/product/{$productCode}")->toArray();
    }

    /**
     * POST /api/plans/create
     *
     * @param array<string, mixed> $data
     */
    public function create(array $data): array
    {
        return $this->http->post('/plans/create', $data)->toArray();
    }

    /**
     * DELETE /api/plans/:id
     */
    public function delete(int $id): array
    {
        return $this->http->delete("/plans/{$id}")->toArray();
    }
}
