<?php

declare(strict_types=1);

namespace UniversalLicense\Cache;

use Illuminate\Contracts\Cache\Repository as CacheRepository;

/**
 * Laravel Cache Adapter
 * 
 * Adapter for Laravel's cache system (Redis, Memcached, Database, etc.)
 * Uses Laravel's unified cache interface for seamless integration.
 * 
 * @package UniversalLicense\Cache
 */
class LaravelCache implements CacheInterface
{
    private CacheRepository $cache;
    private string $prefix;
    
    /**
     * Create Laravel cache adapter
     * 
     * @param CacheRepository $cache Laravel cache repository instance
     * @param string $prefix Cache key prefix for namespacing
     * 
     * @example
     * ```php
     * // In Laravel service provider or controller
     * use Illuminate\Support\Facades\Cache;
     * 
     * $cache = new LaravelCache(Cache::store('redis'), 'license');
     * 
     * // Now all cache keys will be prefixed with 'license:'
     * $cache->set('validation:ABC', $result); // Stored as 'license:validation:ABC'
     * ```
     */
    public function __construct(CacheRepository $cache, string $prefix = 'license')
    {
        $this->cache = $cache;
        $this->prefix = $prefix;
    }
    
    /**
     * {@inheritdoc}
     */
    public function get(string $key): mixed
    {
        return $this->cache->get($this->prefixKey($key));
    }
    
    /**
     * {@inheritdoc}
     */
    public function set(string $key, mixed $value, int $ttl = 3600): bool
    {
        return $this->cache->put($this->prefixKey($key), $value, $ttl);
    }
    
    /**
     * {@inheritdoc}
     */
    public function has(string $key): bool
    {
        return $this->cache->has($this->prefixKey($key));
    }
    
    /**
     * {@inheritdoc}
     */
    public function forget(string $key): bool
    {
        return $this->cache->forget($this->prefixKey($key));
    }
    
    /**
     * {@inheritdoc}
     */
    public function clear(): bool
    {
        // Laravel's flush() clears entire cache store
        // For prefix-specific clearing, use clearPattern instead
        return $this->cache->flush();
    }
    
    /**
     * {@inheritdoc}
     */
    public function clearPattern(string $pattern): int
    {
        // Laravel doesn't have built-in pattern clearing
        // This is a limitation - so we consider using tags instead
        
        // For Redis/Memcached stores with tags support:
        if (method_exists($this->cache, 'tags')) {
            $tag = $this->prefix;
            $this->cache->tags($tag)->flush();
            return 0; // Can't count cleared items with tags
        }
        
        // Fallback: not supported without tags
        return 0;
    }
    
    /**
     * {@inheritdoc}
     */
    public function many(array $keys): array
    {
        $prefixedKeys = array_map([$this, 'prefixKey'], $keys);
        $results = $this->cache->many($prefixedKeys);
        
        // Remove prefix from result keys
        $unprefixed = [];
        foreach ($results as $prefixedKey => $value) {
            $originalKey = $this->unprefixKey($prefixedKey);
            $unprefixed[$originalKey] = $value;
        }
        
        return $unprefixed;
    }
    
    /**
     * {@inheritdoc}
     */
    public function putMany(array $values, int $ttl = 3600): bool
    {
        $prefixed = [];
        foreach ($values as $key => $value) {
            $prefixed[$this->prefixKey($key)] = $value;
        }
        
        return $this->cache->putMany($prefixed, $ttl);
    }
    
    /**
     * {@inheritdoc}
     */
    public function increment(string $key, int $value = 1): int|false
    {
        $result = $this->cache->increment($this->prefixKey($key), $value);
        return $result !== false ? $result : false;
    }
    
    /**
     * {@inheritdoc}
     */
    public function decrement(string $key, int $value = 1): int|false
    {
        $result = $this->cache->decrement($this->prefixKey($key), $value);
        return $result !== false ? $result : false;
    }
    
    /**
     * {@inheritdoc}
     */
    public function remember(string $key, int $ttl, callable $callback): mixed
    {
        return $this->cache->remember($this->prefixKey($key), $ttl, $callback);
    }
    
    /**
     * Remember forever (no expiration)
     * 
     * @param string $key Cache key
     * @param callable $callback Callback to compute value
     * @return mixed
     * 
     * @example
     * ```php
     * $publicKey = $cache->rememberForever('public_key', function() use ($client) {
     *     return $client->validation->getPublicKey();
     * });
     * ```
     */
    public function rememberForever(string $key, callable $callback): mixed
    {
        return $this->cache->rememberForever($this->prefixKey($key), $callback);
    }
    
    /**
     * Get or set with tags (Laravel 5.8+)
     * 
     * @param array<string> $tags Cache tags
     * @param string $key Cache key
     * @param int $ttl TTL in seconds
     * @param callable $callback Callback to compute value
     * @return mixed
     * 
     * @example
     * ```php
     * // Cache with tags for easy invalidation
     * $licenses = $cache->rememberWithTags(
     *     ['licenses', 'organization:123'],
     *     'org:123:licenses',
     *     3600,
     *     fn() => $client->licenses->getAll(['organizationId' => 123])
     * );
     * 
     * // Later, clear all licenses for org 123
     * $cache->forgetByTag('organization:123');
     * ```
     */
    public function rememberWithTags(array $tags, string $key, int $ttl, callable $callback): mixed
    {
        if (!method_exists($this->cache, 'tags')) {
            // Fallback to regular remember if tags not supported
            return $this->remember($key, $ttl, $callback);
        }
        
        return $this->cache->tags($tags)->remember($this->prefixKey($key), $ttl, $callback);
    }
    
    /**
     * Forget all items with specific tag
     * 
     * @param string $tag Tag to clear
     * @return bool
     * 
     * @example
     * ```php
     * // Clear all license cache
     * $cache->forgetByTag('licenses');
     * 
     * // Clear cache for specific organization
     * $cache->forgetByTag('organization:123');
     * ```
     */
    public function forgetByTag(string $tag): bool
    {
        if (!method_exists($this->cache, 'tags')) {
            return false;
        }
        
        return $this->cache->tags($tag)->flush();
    }
    
    /**
     * Add prefix to cache key
     * 
     * @param string $key Original key
     * @return string Prefixed key
     */
    private function prefixKey(string $key): string
    {
        return $this->prefix . ':' . $key;
    }
    
    /**
     * Remove prefix from cache key
     * 
     * @param string $key Prefixed key
     * @return string Original key
     */
    private function unprefixKey(string $key): string
    {
        $prefix = $this->prefix . ':';
        if (str_starts_with($key, $prefix)) {
            return substr($key, strlen($prefix));
        }
        return $key;
    }
}