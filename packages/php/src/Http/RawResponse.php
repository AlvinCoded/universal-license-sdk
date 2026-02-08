<?php

declare(strict_types=1);

namespace UniversalLicense\Http;

/**
 * Raw HTTP Response Wrapper
 *
 * Used for endpoints that return non-JSON payloads (CSV/XLSX, etc.).
 */
class RawResponse
{
    /**
     * @param array<string, string> $headers
     */
    public function __construct(
        private int $statusCode,
        private string $body,
        private array $headers = []
    ) {}

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getBody(): string
    {
        return $this->body;
    }

    /**
     * @return array<string, string>
     */
    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function getHeader(string $name): ?string
    {
        return $this->headers[$name] ?? null;
    }

    public function isSuccess(): bool
    {
        return $this->statusCode >= 200 && $this->statusCode < 300;
    }
}
