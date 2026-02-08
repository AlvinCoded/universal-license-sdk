<?php

declare(strict_types=1);

namespace UniversalLicense\Exceptions;

/**
 * API Exception
 * 
 * Thrown when API requests fail (network errors, server errors, etc.)
 * Contains HTTP status code and response details.
 * 
 * @package UniversalLicense\Exceptions
 */
class ApiException extends LicenseException
{
    /**
     * HTTP request method
     * 
     * @var string|null
     */
    protected ?string $method = null;
    
    /**
     * Request URL
     * 
     * @var string|null
     */
    protected ?string $url = null;
    
    /**
     * Response body
     * 
     * @var string|null
     */
    protected ?string $responseBody = null;
    
    /**
     * Create API exception for network error
     * 
     * @param string $message Error message
     * @param string|null $url Request URL
     * @return static
     * 
     * @example
     * ```php
     * throw ApiException::networkError(
     *     'Could not connect to license server',
     *     'https://license-server.com/api/licenses/validate'
     * );
     * ```
     */
    public static function networkError(string $message, ?string $url = null): static
    {
        $exception = new static($message, 'NETWORK_ERROR', [
            'url' => $url,
        ]);
        
        $exception->url = $url;
        $exception->setStatusCode(0); // No HTTP response
        
        return $exception;
    }
    
    /**
     * Create API exception for timeout
     * 
     * @param int $timeout Timeout in seconds
     * @param string|null $url Request URL
     * @return static
     * 
     * @example
     * ```php
     * throw ApiException::timeout(30, 'https://license-server.com/api/...');
     * ```
     */
    public static function timeout(int $timeout, ?string $url = null): static
    {
        $message = "Request timed out after {$timeout} seconds";
        
        $exception = new static($message, 'TIMEOUT', [
            'timeout' => $timeout,
            'url' => $url,
        ]);
        
        $exception->url = $url;
        $exception->setStatusCode(0);
        
        return $exception;
    }
    
    /**
     * Create API exception for unauthorized access
     * 
     * @param string|null $url Request URL
     * @return static
     * 
     * @example
     * ```php
     * throw ApiException::unauthorized();
     * ```
     */
    public static function unauthorized(?string $url = null): static
    {
        $message = "Unauthorized. Please provide valid authentication credentials.";
        
        $exception = new static($message, 'UNAUTHORIZED', [
            'url' => $url,
        ]);
        
        $exception->url = $url;
        $exception->setStatusCode(401);
        
        return $exception;
    }
    
    /**
     * Create API exception for forbidden access
     * 
     * @param string|null $url Request URL
     * @return static
     * 
     * @example
     * ```php
     * throw ApiException::forbidden();
     * ```
     */
    public static function forbidden(?string $url = null): static
    {
        $message = "Forbidden. You don't have permission to access this resource.";
        
        $exception = new static($message, 'FORBIDDEN', [
            'url' => $url,
        ]);
        
        $exception->url = $url;
        $exception->setStatusCode(403);
        
        return $exception;
    }
    
    /**
     * Create API exception for not found
     * 
     * @param string $resource Resource name
     * @param string|null $url Request URL
     * @return static
     * 
     * @example
     * ```php
     * throw ApiException::notFound('License', '/api/licenses/ABC-123');
     * ```
     */
    public static function notFound(string $resource, ?string $url = null): static
    {
        $message = "{$resource} not found";
        
        $exception = new static($message, 'NOT_FOUND', [
            'resource' => $resource,
            'url' => $url,
        ]);
        
        $exception->url = $url;
        $exception->setStatusCode(404);
        
        return $exception;
    }
    
    /**
     * Create API exception for server error
     * 
     * @param string $message Error message
     * @param int $statusCode HTTP status code
     * @param string|null $url Request URL
     * @param string|null $responseBody Response body
     * @return static
     * 
     * @example
     * ```php
     * throw ApiException::serverError(
     *     'Internal server error',
     *     500,
     *     'https://license-server.com/api/...',
     *     '{"error":"Database connection failed"}'
     * );
     * ```
     */
    public static function serverError(
        string $message,
        int $statusCode = 500,
        ?string $url = null,
        ?string $responseBody = null
    ): static {
        $exception = new static($message, 'SERVER_ERROR', [
            'url' => $url,
            'responseBody' => $responseBody,
        ]);
        
        $exception->url = $url;
        $exception->responseBody = $responseBody;
        $exception->setStatusCode($statusCode);
        
        return $exception;
    }
    
    /**
     * Create API exception for bad request
     * 
     * @param string $message Error message
     * @param array<string, mixed> $validationErrors Validation errors
     * @param string|null $url Request URL
     * @return static
     * 
     * @example
     * ```php
     * throw ApiException::badRequest(
     *     'Validation failed',
     *     ['licenseKey' => 'Invalid format', 'deviceId' => 'Required'],
     *     '/api/licenses/validate'
     * );
     * ```
     */
    public static function badRequest(
        string $message,
        array $validationErrors = [],
        ?string $url = null
    ): static {
        $exception = new static($message, 'BAD_REQUEST', [
            'url' => $url,
            'validationErrors' => $validationErrors,
        ]);
        
        $exception->url = $url;
        $exception->setStatusCode(400);
        
        return $exception;
    }
    
    /**
     * Create API exception for service unavailable
     * 
     * @param string|null $url Request URL
     * @return static
     * 
     * @example
     * ```php
     * throw ApiException::serviceUnavailable();
     * ```
     */
    public static function serviceUnavailable(?string $url = null): static
    {
        $message = "Service temporarily unavailable. Please try again later.";
        
        $exception = new static($message, 'SERVICE_UNAVAILABLE', [
            'url' => $url,
        ]);
        
        $exception->url = $url;
        $exception->setStatusCode(503);
        
        return $exception;
    }
    
    /**
     * Create API exception for rate limit exceeded
     * 
     * @param int|null $retryAfter Seconds until retry allowed
     * @param string|null $url Request URL
     * @return static
     * 
     * @example
     * ```php
     * throw ApiException::rateLimitExceeded(60);
     * ```
     */
    public static function rateLimitExceeded(?int $retryAfter = null, ?string $url = null): static
    {
        $message = "Rate limit exceeded.";
        
        if ($retryAfter) {
            $message .= " Please retry after {$retryAfter} seconds.";
        }
        
        $exception = new static($message, 'RATE_LIMIT_EXCEEDED', [
            'retryAfter' => $retryAfter,
            'url' => $url,
        ]);
        
        $exception->url = $url;
        $exception->setStatusCode(429);
        
        return $exception;
    }
    
    /**
     * Set HTTP request method
     * 
     * @param string $method HTTP method (GET, POST, etc.)
     * @return self
     */
    public function setMethod(string $method): self
    {
        $this->method = $method;
        return $this;
    }
    
    /**
     * Get HTTP request method
     * 
     * @return string|null
     */
    public function getMethod(): ?string
    {
        return $this->method;
    }
    
    /**
     * Set request URL
     * 
     * @param string $url Request URL
     * @return self
     */
    public function setUrl(string $url): self
    {
        $this->url = $url;
        return $this;
    }
    
    /**
     * Get request URL
     * 
     * @return string|null
     */
    public function getUrl(): ?string
    {
        return $this->url;
    }
    
    /**
     * Set response body
     * 
     * @param string $responseBody Response body
     * @return self
     */
    public function setResponseBody(string $responseBody): self
    {
        $this->responseBody = $responseBody;
        return $this;
    }
    
    /**
     * Get response body
     * 
     * @return string|null
     */
    public function getResponseBody(): ?string
    {
        return $this->responseBody;
    }
    
    /**
     * {@inheritdoc}
     */
    public function isRetryable(): bool
    {
        // Network errors, timeouts, and service unavailable are retryable
        return in_array($this->errorCode, [
            'NETWORK_ERROR',
            'TIMEOUT',
            'SERVICE_UNAVAILABLE',
            'CONNECTION_REFUSED',
        ]) || $this->statusCode === 503;
    }
    
    /**
     * {@inheritdoc}
     */
    public function getUserMessage(): string
    {
        // Provide user-friendly messages based on status code
        return match ($this->statusCode) {
            401 => 'Authentication failed. Please check your credentials.',
            403 => 'Access denied. You don\'t have permission to perform this action.',
            404 => 'Resource not found.',
            429 => 'Too many requests. Please try again later.',
            500, 502, 503, 504 => 'Server error. Please try again later.',
            0 => 'Could not connect to the license server. Please check your internet connection.',
            default => $this->getMessage(),
        };
    }
    
    /**
     * {@inheritdoc}
     */
    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'method' => $this->method,
            'url' => $this->url,
            'responseBody' => $this->responseBody,
        ]);
    }
}