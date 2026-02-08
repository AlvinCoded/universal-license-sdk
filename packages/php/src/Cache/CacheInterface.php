<?php

declare(strict_types=1);

namespace UniversalLicense\Cache;

/**
 * Cache Interface
 * 
 * Defines the contract for cache implementations.
 * Allows flexibility to use different cache backends (file, Redis, Memcached, Laravel, etc.)
 * 
 * @package UniversalLicense\Cache
 */
interface CacheInterface
{
    /**
     * Retrieve an item from the cache
     * 
     * @param string $key Cache key
     * @return mixed|null Cached value or null if not found/expired
     * 
     * @example
     * ```php
     * $value = $cache->get('license:validation:ABC-123');
     * if ($value !== null) {
     *     // Use cached value
     * }
     * ```
     */
    public function get(string $key): mixed;
    
    /**
     * Store an item in the cache
     * 
     * @param string $key Cache key
     * @param mixed $value Value to cache (will be serialized)
     * @param int $ttl Time to live in seconds (default: 3600 = 1 hour)
     * @return bool True on success, false on failure
     * 
     * @example
     * ```php
     * $cache->set('license:validation:ABC-123', $validationResult, 3600);
     * ```
     */
    public function set(string $key, mixed $value, int $ttl = 3600): bool;
    
    /**
     * Check if an item exists in the cache
     * 
     * @param string $key Cache key
     * @return bool True if exists and not expired
     * 
     * @example
     * ```php
     * if ($cache->has('license:ABC-123')) {
     *     $license = $cache->get('license:ABC-123');
     * }
     * ```
     */
    public function has(string $key): bool;
    
    /**
     * Remove an item from the cache
     * 
     * @param string $key Cache key
     * @return bool True on success, false on failure
     * 
     * @example
     * ```php
     * $cache->forget('license:ABC-123'); // Force refresh on next get
     * ```
     */
    public function forget(string $key): bool;
    
    /**
     * Clear all cached items
     * 
     * @return bool True on success, false on failure
     * 
     * @example
     * ```php
     * $cache->clear(); // Clear entire cache
     * ```
     */
    public function clear(): bool;
    
    /**
     * Clear items matching a pattern
     * 
     * @param string $pattern Pattern to match (e.g., 'license:*')
     * @return int Number of items cleared
     * 
     * @example
     * ```php
     * // Clear all license-related cache
     * $cache->clearPattern('license:*');
     * 
     * // Clear all validation cache
     * $cache->clearPattern('validation:*');
     * ```
     */
    public function clearPattern(string $pattern): int;
    
    /**
     * Get multiple items at once
     * 
     * @param array<string> $keys Array of cache keys
     * @return array<string, mixed> Associative array of key => value pairs
     * 
     * @example
     * ```php
     * $values = $cache->many(['license:ABC', 'license:XYZ']);
     * // Returns: ['license:ABC' => $value1, 'license:XYZ' => $value2]
     * ```
     */
    public function many(array $keys): array;
    
    /**
     * Set multiple items at once
     * 
     * @param array<string, mixed> $values Associative array of key => value pairs
     * @param int $ttl Time to live in seconds
     * @return bool True if all items were set successfully
     * 
     * @example
     * ```php
     * $cache->putMany([
     *     'license:ABC' => $license1,
     *     'license:XYZ' => $license2
     * ], 3600);
     * ```
     */
    public function putMany(array $values, int $ttl = 3600): bool;
    
    /**
     * Increment a numeric value in the cache
     * 
     * @param string $key Cache key
     * @param int $value Amount to increment by (default: 1)
     * @return int|false New value or false on failure
     * 
     * @example
     * ```php
     * $cache->increment('api:requests:count'); // Increment by 1
     * $cache->increment('api:requests:count', 5); // Increment by 5
     * ```
     */
    public function increment(string $key, int $value = 1): int|false;
    
    /**
     * Decrement a numeric value in the cache
     * 
     * @param string $key Cache key
     * @param int $value Amount to decrement by (default: 1)
     * @return int|false New value or false on failure
     * 
     * @example
     * ```php
     * $cache->decrement('api:remaining:quota'); // Decrement by 1
     * ```
     */
    public function decrement(string $key, int $value = 1): int|false;
    
    /**
     * Remember a value in cache (get or set)
     * 
     * Retrieves value from cache, or computes and stores it if not found.
     * 
     * @param string $key Cache key
     * @param int $ttl Time to live in seconds
     * @param callable $callback Function to compute value if not cached
     * @return mixed Cached or computed value
     * 
     * @example
     * ```php
     * $products = $cache->remember('products:all', 3600, function() use ($client) {
     *     return $client->products->getAll();
     * });
     * ```
     */
    public function remember(string $key, int $ttl, callable $callback): mixed;
}