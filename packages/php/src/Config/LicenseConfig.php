<?php

declare(strict_types=1);

namespace UniversalLicense\Config;

/**
 * License Configuration
 * 
 * Holds all configuration options for the License Client
 */
class LicenseConfig
{
    private string $baseUrl;
    private ?string $apiKey;
    private ?string $token;
    private ?string $appKey;
    private ?string $appCode;
    private int $timeout;
    private bool $cache;
    private bool $debug;
    private array $headers;
    
    public function __construct(array $config)
    {
        if (!isset($config['baseUrl'])) {
            throw new \InvalidArgumentException('baseUrl is required');
        }
        
        $this->baseUrl = rtrim($config['baseUrl'], '/');
        $this->apiKey = $config['apiKey'] ?? null;
        $this->token = $config['token'] ?? null;
        $this->appKey = $config['appKey'] ?? null;
        $this->appCode = $config['appCode'] ?? null;
        $this->timeout = $config['timeout'] ?? 30;
        $this->cache = $config['cache'] ?? true;
        $this->debug = $config['debug'] ?? false;

        $headers = $config['headers'] ?? [];
        if ($this->appKey) {
            $headers['X-ULS-App-Key'] = $this->appKey;
        }
        if ($this->appCode) {
            $headers['X-ULS-App-Code'] = $this->appCode;
        }
        $this->headers = $headers;
    }
    
    public function getBaseUrl(): string
    {
        return $this->baseUrl;
    }
    
    public function getApiKey(): ?string
    {
        return $this->apiKey;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(?string $token): void
    {
        $this->token = $token;
    }
    
    public function getTimeout(): int
    {
        return $this->timeout;
    }
    
    public function isCacheEnabled(): bool
    {
        return $this->cache;
    }
    
    public function isDebugEnabled(): bool
    {
        return $this->debug;
    }
    
    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function getAppKey(): ?string
    {
        return $this->appKey;
    }

    public function getAppCode(): ?string
    {
        return $this->appCode;
    }
    
    /**
     * Get full URL for an endpoint
     */
    public function url(string $endpoint): string
    {
        return $this->baseUrl . '/' . ltrim($endpoint, '/');
    }
}