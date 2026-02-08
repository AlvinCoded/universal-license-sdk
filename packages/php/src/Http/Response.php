<?php

declare(strict_types=1);

namespace UniversalLicense\Http;

/**
 * HTTP Response Wrapper
 * 
 * Wraps API responses with convenient methods for data access.
 * Mirrors the Response class from packages/js/src/http/Response.ts
 * 
 * @package UniversalLicense\Http
 */
class Response
{
    private int $statusCode;
    private array $data;
    private array $headers;
    
    /**
     * Create response instance
     * 
     * @param int $statusCode HTTP status code
     * @param array<string, mixed> $data Response body data
     * @param array<string, string> $headers Response headers
     */
    public function __construct(int $statusCode, array $data, array $headers = [])
    {
        $this->statusCode = $statusCode;
        $this->data = $data;
        $this->headers = $headers;
    }
    
    /**
     * Get HTTP status code
     * 
     * @return int
     */
    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
    
    /**
     * Get response data
     * 
     * @return array<string, mixed>
     */
    public function getData(): array
    {
        return $this->data;
    }
    
    /**
     * Get response headers
     * 
     * @return array<string, string>
     */
    public function getHeaders(): array
    {
        return $this->headers;
    }
    
    /**
     * Get specific header value
     * 
     * @param string $name Header name
     * @return string|null
     */
    public function getHeader(string $name): ?string
    {
        return $this->headers[$name] ?? null;
    }
    
    /**
     * Check if response is successful (2xx)
     * 
     * @return bool
     */
    public function isSuccess(): bool
    {
        return $this->statusCode >= 200 && $this->statusCode < 300;
    }
    
    /**
     * Check if response is client error (4xx)
     * 
     * @return bool
     */
    public function isClientError(): bool
    {
        return $this->statusCode >= 400 && $this->statusCode < 500;
    }
    
    /**
     * Check if response is server error (5xx)
     * 
     * @return bool
     */
    public function isServerError(): bool
    {
        return $this->statusCode >= 500 && $this->statusCode < 600;
    }
    
    /**
     * Get response data as array
     * 
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return $this->data;
    }
    
    /**
     * Get nested value from response data
     * 
     * Supports dot notation for nested access.
     * Example: get('license.tier') returns $data['license']['tier']
     * 
     * @param string $key Key or dot-notation path
     * @param mixed $default Default value if key not found
     * @return mixed
     */
    public function get(string $key, mixed $default = null): mixed
    {
        // Simple key access
        if (isset($this->data[$key])) {
            return $this->data[$key];
        }
        
        // Dot notation support
        if (str_contains($key, '.')) {
            $segments = explode('.', $key);
            $value = $this->data;
            
            foreach ($segments as $segment) {
                if (!isset($value[$segment])) {
                    return $default;
                }
                $value = $value[$segment];
            }
            
            return $value;
        }
        
        return $default;
    }
    
    /**
     * Check if response has specific key
     * 
     * @param string $key Key to check
     * @return bool
     */
    public function has(string $key): bool
    {
        return $this->get($key) !== null;
    }
    
    /**
     * Get error message from response
     * 
     * Extracts error message from common backend error formats.
     * Matches your backend error response structure.
     * 
     * @return string|null
     */
    public function getErrorMessage(): ?string
    {
        // Check common error fields from backend
        return $this->get('error') 
            ?? $this->get('message')
            ?? $this->get('reason')
            ?? null;
    }
    
    /**
     * Check if response indicates success
     * 
     * Checks both HTTP status and 'success' field in response body.
     * Matches your backend API response format.
     * 
     * @return bool
     */
    public function wasSuccessful(): bool
    {
        return $this->isSuccess() && ($this->get('success', true) !== false);
    }
    
    /**
     * Convert response to JSON string
     * 
     * @return string
     */
    public function toJson(): string
    {
        return json_encode($this->data, JSON_PRETTY_PRINT);
    }
    
    /**
     * Magic method for property access
     * 
     * Allows accessing response data as properties:
     * $response->license instead of $response->get('license')
     * 
     * @param string $name Property name
     * @return mixed
     */
    public function __get(string $name): mixed
    {
        return $this->get($name);
    }
    
    /**
     * Magic method to check if property exists
     * 
     * @param string $name Property name
     * @return bool
     */
    public function __isset(string $name): bool
    {
        return $this->has($name);
    }
    
    /**
     * Convert to string (returns JSON)
     * 
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}