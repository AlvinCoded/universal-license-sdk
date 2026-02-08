<?php

declare(strict_types=1);

namespace UniversalLicense\Modules;

use UniversalLicense\Http\HttpClient;
use UniversalLicense\Config\LicenseConfig;

/**
 * Auth Module
 *
 * Matches backend endpoints under /api/auth
 */
class AuthModule
{
    public function __construct(
        private HttpClient $http,
        private LicenseConfig $config
    ) {}

    /**
     * Login and receive JWT token
     * POST /api/auth/login
     *
     * @return array{token: string, user: array<string, mixed>}
     */
    public function login(string $username, string $password): array
    {
        $response = $this->http->post('/auth/login', [
            'username' => $username,
            'password' => $password,
        ]);

        $data = $response->toArray();

        // If token is returned, store it for subsequent requests
        if (isset($data['token']) && is_string($data['token'])) {
            $this->http->setToken($data['token']);
        }

        return $data;
    }

    /**
     * Verify current token
     * GET /api/auth/verify
     *
     * @return array<string, mixed>
     */
    public function verify(): array
    {
        $response = $this->http->get('/auth/verify', [], false);
        return $response->toArray();
    }

    /**
     * Update user profile
     * PATCH /api/auth/profile
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function updateProfile(array $data): array
    {
        $response = $this->http->patch('/auth/profile', $data);
        return $response->toArray();
    }
}
