<?php

declare(strict_types=1);

namespace UniversalLicense\Http;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;
use UniversalLicense\Config\LicenseConfig;
use UniversalLicense\Cache\CacheInterface;
use UniversalLicense\Cache\FileCache;
use UniversalLicense\Exceptions\ApiException;
use UniversalLicense\Exceptions\LicenseException;
use Psr\Http\Message\ResponseInterface;
use UniversalLicense\Http\RawResponse;

/**
 * HTTP Client for License Server API
 * 
 * Handles all HTTP communication with the Universal License Server.
 * Mirrors the HttpClient from packages/js/src/http/HttpClient.ts
 * 
 * Features:
 * - Automatic retries with exponential backoff
 * - Response caching
 * - Error handling and mapping
 * - Request/response logging (debug mode)
 * 
 * @package UniversalLicense\Http
 */
class HttpClient
{
    private Client $client;
    private LicenseConfig $config;
    private ?CacheInterface $cache = null;
    private int $retryAttempts = 0;
    private const MAX_RETRIES = 3;
    private const RETRY_DELAY_MS = 1000; // Base delay: 1 second
    
    /**
     * Create HTTP client instance
     * 
     * @param LicenseConfig $config Configuration object
     */
    public function __construct(LicenseConfig $config)
    {
        $this->config = $config;
        
        // Initialize Guzzle HTTP client
        $this->client = new Client([
            'base_uri' => $config->getBaseUrl(),
            'timeout' => $config->getTimeout(),
            'headers' => array_merge(
                [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'User-Agent' => 'UniversalLicense-PHP-SDK/0.1.0',
                ],
                $config->getHeaders()
            ),
        ]);
        
        // Initialize cache if enabled
        if ($config->isCacheEnabled()) {
            $this->cache = new FileCache();
        }
    }
    
    /**
     * Set custom cache implementation
     * 
     * @param CacheInterface $cache Custom cache implementation
     * @return void
     */
    public function setCache(CacheInterface $cache): void
    {
        $this->cache = $cache;
    }

    /**
     * Set (or clear) bearer token for authenticated endpoints
     */
    public function setToken(?string $token): void
    {
        $this->config->setToken($token);
    }
    
    /**
     * GET request
     * 
     * @param string $endpoint API endpoint (e.g., '/products')
     * @param array<string, mixed> $query Query parameters
     * @param bool $useCache Whether to use cache for this request
     * @return Response
     * @throws ApiException
     */
    public function get(string $endpoint, array $query = [], bool $useCache = true): Response
    {
        $url = $this->buildUrl($endpoint, $query);
        
        // Check cache first
        if ($useCache && $this->cache && $this->config->isCacheEnabled()) {
            $cacheKey = $this->getCacheKey('GET', $url);
            $cached = $this->cache->get($cacheKey);
            
            if ($cached !== null) {
                $this->log('Cache HIT', ['url' => $url]);
                return new Response(200, $cached, ['X-Cache' => 'HIT']);
            }
            
            $this->log('Cache MISS', ['url' => $url]);
        }
        
        try {
            $response = $this->executeRequest('GET', $endpoint, [
                'query' => $query
            ]);
            
            // Cache successful responses
            if ($useCache && $this->cache && $response->isSuccess()) {
                $cacheKey = $this->getCacheKey('GET', $url);
                $this->cache->set($cacheKey, $response->toArray(), 3600); // 1 hour TTL
            }
            
            return $response;
            
        } catch (\Exception $e) {
            throw $this->handleException($e, 'GET', $endpoint);
        }
    }
    
    /**
     * POST request
     * 
     * @param string $endpoint API endpoint
     * @param array<string, mixed> $data Request body data
     * @return Response
     * @throws ApiException
     */
    public function post(string $endpoint, array $data = [], array $options = []): Response
    {
        try {
            return $this->executeRequest('POST', $endpoint, array_merge(
                [
                    'json' => $data,
                ],
                $options
            ));
        } catch (\Exception $e) {
            throw $this->handleException($e, 'POST', $endpoint);
        }
    }
    
    /**
     * PUT request
     * 
     * @param string $endpoint API endpoint
     * @param array<string, mixed> $data Request body data
     * @return Response
     * @throws ApiException
     */
    public function put(string $endpoint, array $data = []): Response
    {
        try {
            return $this->executeRequest('PUT', $endpoint, [
                'json' => $data
            ]);
        } catch (\Exception $e) {
            throw $this->handleException($e, 'PUT', $endpoint);
        }
    }

    /**
     * PATCH request
     *
     * @param string $endpoint API endpoint
     * @param array<string, mixed> $data Request body data
     * @return Response
     * @throws ApiException
     */
    public function patch(string $endpoint, array $data = []): Response
    {
        try {
            return $this->executeRequest('PATCH', $endpoint, [
                'json' => $data
            ]);
        } catch (\Exception $e) {
            throw $this->handleException($e, 'PATCH', $endpoint);
        }
    }

    /**
     * GET request returning raw body (for exports like CSV/XLSX)
     */
    public function getRaw(string $endpoint, array $query = []): RawResponse
    {
        try {
            $guzzleResponse = $this->client->request('GET', $endpoint, [
                'query' => $query,
                'headers' => $this->buildAuthHeaders(),
                'http_errors' => false,
            ]);

            return $this->createRawResponse($guzzleResponse);
        } catch (\Exception $e) {
            throw $this->handleException($e, 'GET', $endpoint);
        }
    }
    
    /**
     * DELETE request
     * 
     * @param string $endpoint API endpoint
     * @return Response
     * @throws ApiException
     */
    public function delete(string $endpoint): Response
    {
        try {
            return $this->executeRequest('DELETE', $endpoint);
        } catch (\Exception $e) {
            throw $this->handleException($e, 'DELETE', $endpoint);
        }
    }
    
    /**
     * Execute HTTP request with retry logic
     * 
     * Implements exponential backoff for retries on network errors.
     * 
     * @param string $method HTTP method
     * @param string $endpoint API endpoint
     * @param array<string, mixed> $options Request options
     * @return Response
     * @throws GuzzleException
     */
    private function executeRequest(string $method, string $endpoint, array $options = []): Response
    {
        $attempt = 0;
        $lastException = null;
        
        while ($attempt < self::MAX_RETRIES) {
            try {
                $this->log("Request attempt #{$attempt}", [
                    'method' => $method,
                    'endpoint' => $endpoint
                ]);

                // Inject bearer token if configured
                $options['headers'] = array_merge(
                    $this->buildAuthHeaders(),
                    $options['headers'] ?? []
                );
                
                $guzzleResponse = $this->client->request($method, $endpoint, $options);
                
                $response = $this->createResponse($guzzleResponse);
                
                $this->log('Request successful', [
                    'method' => $method,
                    'endpoint' => $endpoint,
                    'status' => $response->getStatusCode()
                ]);
                
                // Reset retry counter on success
                $this->retryAttempts = 0;
                
                return $response;
                
            } catch (ConnectException $e) {
                // Network error - retry
                $lastException = $e;
                $attempt++;
                
                if ($attempt < self::MAX_RETRIES) {
                    $delay = $this->calculateRetryDelay($attempt);
                    $this->log("Network error, retrying in {$delay}ms", [
                        'attempt' => $attempt,
                        'error' => $e->getMessage()
                    ]);
                    usleep($delay * 1000); // Convert ms to microseconds
                    continue;
                }
                
            } catch (RequestException $e) {
                // HTTP error (4xx, 5xx)
                if ($e->hasResponse()) {
                    $response = $this->createResponse($e->getResponse());
                    
                    // Don't retry client errors (4xx)
                    if ($response->getStatusCode() < 500) {
                        return $response;
                    }
                    
                    // Retry server errors (5xx)
                    $lastException = $e;
                    $attempt++;
                    
                    if ($attempt < self::MAX_RETRIES) {
                        $delay = $this->calculateRetryDelay($attempt);
                        $this->log("Server error, retrying in {$delay}ms", [
                            'attempt' => $attempt,
                            'status' => $response->getStatusCode()
                        ]);
                        usleep($delay * 1000);
                        continue;
                    }
                }
                
                throw $e;
            }
        }
        
        // All retries exhausted
        throw $lastException ?? new \RuntimeException('Request failed after maximum retries');
    }
    
    /**
     * Calculate retry delay with exponential backoff
     * 
     * @param int $attempt Current attempt number (1-indexed)
     * @return int Delay in milliseconds
     */
    private function calculateRetryDelay(int $attempt): int
    {
        // Exponential backoff: 1s, 2s, 4s
        return self::RETRY_DELAY_MS * (2 ** ($attempt - 1));
    }
    
    /**
     * Create Response object from Guzzle response
     * 
     * @param ResponseInterface $guzzleResponse Guzzle response
     * @return Response
     */
    private function createResponse(ResponseInterface $guzzleResponse): Response
    {
        $body = (string) $guzzleResponse->getBody();
        $data = json_decode($body, true) ?? [];
        
        // Convert Guzzle headers to associative array
        $headers = [];
        foreach ($guzzleResponse->getHeaders() as $name => $values) {
            $headers[$name] = $values[0] ?? '';
        }
        
        return new Response(
            $guzzleResponse->getStatusCode(),
            $data,
            $headers
        );
    }

    /**
     * Create RawResponse object from Guzzle response
     */
    private function createRawResponse(ResponseInterface $guzzleResponse): RawResponse
    {
        $body = (string) $guzzleResponse->getBody();

        $headers = [];
        foreach ($guzzleResponse->getHeaders() as $name => $values) {
            $headers[$name] = $values[0] ?? '';
        }

        return new RawResponse(
            $guzzleResponse->getStatusCode(),
            $body,
            $headers
        );
    }

    /**
     * Build Authorization headers if token is configured
     *
     * @return array<string, string>
     */
    private function buildAuthHeaders(): array
    {
        $token = $this->config->getToken();
        if (!$token) {
            return [];
        }

        return ['Authorization' => 'Bearer ' . $token];
    }
    
    /**
     * Handle exceptions and convert to ApiException
     * 
     * Maps backend error responses to SDK exceptions.
     * 
     * @param \Exception $exception Original exception
     * @param string $method HTTP method
     * @param string $endpoint API endpoint
     * @return ApiException
     */
    private function handleException(\Exception $exception, string $method, string $endpoint): ApiException
    {
        $message = $exception->getMessage();
        $statusCode = 500;
        
        if ($exception instanceof RequestException && $exception->hasResponse()) {
            $response = $this->createResponse($exception->getResponse());
            $statusCode = $response->getStatusCode();
            $data = $response->toArray();
            
            // Extract error message from response
            $message = $data['error'] ?? $data['message'] ?? $message;
        }
        
        $this->log('Request failed', [
            'method' => $method,
            'endpoint' => $endpoint,
            'error' => $message,
            'status' => $statusCode
        ]);
        
        return new ApiException($message, $statusCode, $exception);
    }
    
    /**
     * Build full URL with query parameters
     * 
     * @param string $endpoint API endpoint
     * @param array<string, mixed> $query Query parameters
     * @return string
     */
    private function buildUrl(string $endpoint, array $query = []): string
    {
        $url = $this->config->url($endpoint);
        
        if (!empty($query)) {
            $url .= '?' . http_build_query($query);
        }
        
        return $url;
    }
    
    /**
     * Generate cache key for request
     * 
     * @param string $method HTTP method
     * @param string $url Full URL
     * @return string
     */
    private function getCacheKey(string $method, string $url): string
    {
        return 'http_' . md5($method . ':' . $url);
    }
    
    /**
     * Get data from cache
     * 
     * @param string $key Cache key
     * @return mixed|null
     */
    public function getFromCache(string $key): mixed
    {
        if (!$this->cache) {
            return null;
        }
        
        return $this->cache->get($key);
    }
    
    /**
     * Save data to cache
     * 
     * @param string $key Cache key
     * @param mixed $value Value to cache
     * @param int $ttl Time to live in seconds
     * @return bool
     */
    public function saveToCache(string $key, mixed $value, int $ttl = 3600): bool
    {
        if (!$this->cache) {
            return false;
        }
        
        return $this->cache->set($key, $value, $ttl);
    }
    
    /**
     * Clear all cached data
     * 
     * @return void
     */
    public function clearCache(): void
    {
        if ($this->cache) {
            $this->cache->clear();
        }
    }
    
    /**
     * Log message (debug mode only)
     * 
     * @param string $message Log message
     * @param array<string, mixed> $context Additional context
     * @return void
     */
    private function log(string $message, array $context = []): void
    {
        if (!$this->config->isDebugEnabled()) {
            return;
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? json_encode($context, JSON_PRETTY_PRINT) : '';
        
        error_log("[{$timestamp}] UniversalLicense: {$message} {$contextStr}");
    }
}