<?php

declare(strict_types=1);

namespace UniversalLicense\Exceptions;

use Exception;

/**
 * Base License Exception
 * 
 * Base exception class for all Universal License SDK exceptions.
 * Provides common functionality for error handling and debugging.
 * 
 * @package UniversalLicense\Exceptions
 */
class LicenseException extends Exception
{
    /**
     * Error code for categorizing exceptions
     * 
     * @var string|null
     */
    protected ?string $errorCode = null;
    
    /**
     * Additional error details
     * 
     * @var array<string, mixed>
     */
    protected array $details = [];
    
    /**
     * HTTP status code (if applicable)
     * 
     * @var int|null
     */
    protected ?int $statusCode = null;
    
    /**
     * Create a new License Exception
     * 
     * @param string $message Exception message
     * @param string|null $errorCode Error code for categorization
     * @param array<string, mixed> $details Additional error details
     * @param int $code Exception code (default: 0)
     * @param \Throwable|null $previous Previous exception
     */
    public function __construct(
        string $message = "",
        ?string $errorCode = null,
        array $details = [],
        int $code = 0,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        
        $this->errorCode = $errorCode;
        $this->details = $details;
    }
    
    /**
     * Get error code
     * 
     * @return string|null
     */
    public function getErrorCode(): ?string
    {
        return $this->errorCode;
    }
    
    /**
     * Get additional error details
     * 
     * @return array<string, mixed>
     */
    public function getDetails(): array
    {
        return $this->details;
    }
    
    /**
     * Get HTTP status code
     * 
     * @return int|null
     */
    public function getStatusCode(): ?int
    {
        return $this->statusCode;
    }
    
    /**
     * Set HTTP status code
     * 
     * @param int $statusCode HTTP status code
     * @return self
     */
    public function setStatusCode(int $statusCode): self
    {
        $this->statusCode = $statusCode;
        return $this;
    }
    
    /**
     * Add detail to error details
     * 
     * @param string $key Detail key
     * @param mixed $value Detail value
     * @return self
     */
    public function addDetail(string $key, mixed $value): self
    {
        $this->details[$key] = $value;
        return $this;
    }
    
    /**
     * Get detail by key
     * 
     * @param string $key Detail key
     * @param mixed $default Default value if key not found
     * @return mixed
     */
    public function getDetail(string $key, mixed $default = null): mixed
    {
        return $this->details[$key] ?? $default;
    }
    
    /**
     * Check if exception has specific detail
     * 
     * @param string $key Detail key
     * @return bool
     */
    public function hasDetail(string $key): bool
    {
        return isset($this->details[$key]);
    }
    
    /**
     * Convert exception to array
     * 
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'error' => $this->getMessage(),
            'errorCode' => $this->errorCode,
            'code' => $this->getCode(),
            'statusCode' => $this->statusCode,
            'details' => $this->details,
            'file' => $this->getFile(),
            'line' => $this->getLine(),
        ];
    }
    
    /**
     * Convert exception to JSON
     * 
     * @return string
     */
    public function toJson(): string
    {
        return json_encode($this->toArray(), JSON_PRETTY_PRINT);
    }
    
    /**
     * Get user-friendly error message
     * 
     * @return string
     */
    public function getUserMessage(): string
    {
        return $this->getMessage();
    }
    
    /**
     * Check if exception is retryable
     * 
     * @return bool
     */
    public function isRetryable(): bool
    {
        // Network errors and timeouts are retryable
        return in_array($this->errorCode, [
            'NETWORK_ERROR',
            'TIMEOUT',
            'SERVICE_UNAVAILABLE',
            'CONNECTION_REFUSED',
        ]);
    }
    
    /**
     * Create exception from HTTP response
     * 
     * @param int $statusCode HTTP status code
     * @param string $message Error message
     * @param array<string, mixed> $responseData Response data
     * @return static
     */
    public static function fromResponse(int $statusCode, string $message, array $responseData = []): static
    {
        $errorCode = $responseData['errorCode'] ?? $responseData['code'] ?? null;
        $details = $responseData['details'] ?? [];
        
        $exception = new static($message, $errorCode, $details);
        $exception->setStatusCode($statusCode);
        
        return $exception;
    }
}