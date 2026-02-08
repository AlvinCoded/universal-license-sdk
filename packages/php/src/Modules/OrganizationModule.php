<?php

declare(strict_types=1);

namespace UniversalLicense\Modules;

use UniversalLicense\Http\HttpClient;
use UniversalLicense\Config\LicenseConfig;
use UniversalLicense\Models\Organization;

/**
 * Organization Module (admin)
 */
class OrganizationModule
{
    public function __construct(
        private HttpClient $http,
        private LicenseConfig $config
    ) {}

    /**
     * GET /api/organizations
     *
     * @return array<Organization>
     */
    public function getAll(): array
    {
        $response = $this->http->get('/organizations');
        $data = $response->toArray();

        return array_map(
            fn($item) => Organization::fromArray($item),
            $data['organizations'] ?? $data
        );
    }

    /**
     * GET /api/organizations/:id
     */
    public function get(int $id): array
    {
        return $this->http->get("/organizations/{$id}")->toArray();
    }

    /**
     * POST /api/organizations
     *
     * @param array<string, mixed> $data
     */
    public function create(array $data): array
    {
        return $this->http->post('/organizations', $data)->toArray();
    }

    /**
     * PUT /api/organizations/:id
     *
     * @param array<string, mixed> $data
     */
    public function update(int $id, array $data): array
    {
        return $this->http->put("/organizations/{$id}", $data)->toArray();
    }

    /**
     * DELETE /api/organizations/:id
     */
    public function delete(int $id): array
    {
        return $this->http->delete("/organizations/{$id}")->toArray();
    }
}
