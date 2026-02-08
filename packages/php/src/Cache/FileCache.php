<?php

declare(strict_types=1);

namespace UniversalLicense\Cache;

/**
 * File-based Cache Implementation
 * 
 * Simple file system cache for environments without Redis/Memcached.
 * Stores cached items as serialized PHP files in a cache directory.
 * 
 * @package UniversalLicense\Cache
 */
class FileCache implements CacheInterface
{
    private string $cacheDir;
    private int $defaultTtl = 3600;
    
    /**
     * Create file cache instance
     * 
     * @param string|null $cacheDir Cache directory path (auto-created if needed)
     * @param int $defaultTtl Default TTL in seconds
     * 
     * @example
     * ```php
     * // Default cache directory
     * $cache = new FileCache();
     * 
     * // Custom cache directory
     * $cache = new FileCache('/var/cache/my-app');
     * 
     * // Custom TTL
     * $cache = new FileCache(null, 7200); // 2 hours default
     * ```
     */
    public function __construct(?string $cacheDir = null, int $defaultTtl = 3600)
    {
        $this->cacheDir = $cacheDir ?? sys_get_temp_dir() . '/universal-license-cache';
        $this->defaultTtl = $defaultTtl;
        
        // Create cache directory if it doesn't exist
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }
    
    /**
     * {@inheritdoc}
     */
    public function get(string $key): mixed
    {
        $file = $this->getFilePath($key);
        
        if (!file_exists($file)) {
            return null;
        }
        
        $content = @file_get_contents($file);
        if ($content === false) {
            return null;
        }
        
        $data = @unserialize($content);
        if ($data === false) {
            // Corrupted cache file
            $this->forget($key);
            return null;
        }
        
        // Check expiration
        if (isset($data['expires_at']) && time() > $data['expires_at']) {
            $this->forget($key);
            return null;
        }
        
        return $data['value'] ?? null;
    }
    
    /**
     * {@inheritdoc}
     */
    public function set(string $key, mixed $value, int $ttl = 3600): bool
    {
        $ttl = $ttl ?: $this->defaultTtl;
        
        $data = [
            'value' => $value,
            'expires_at' => time() + $ttl,
            'created_at' => time(),
        ];
        
        $file = $this->getFilePath($key);
        $serialized = serialize($data);
        
        return @file_put_contents($file, $serialized, LOCK_EX) !== false;
    }
    
    /**
     * {@inheritdoc}
     */
    public function has(string $key): bool
    {
        return $this->get($key) !== null;
    }
    
    /**
     * {@inheritdoc}
     */
    public function forget(string $key): bool
    {
        $file = $this->getFilePath($key);
        
        if (file_exists($file)) {
            return @unlink($file);
        }
        
        return true;
    }
    
    /**
     * {@inheritdoc}
     */
    public function clear(): bool
    {
        $files = glob($this->cacheDir . '/*.cache');
        
        if ($files === false) {
            return false;
        }
        
        $success = true;
        foreach ($files as $file) {
            if (!@unlink($file)) {
                $success = false;
            }
        }
        
        return $success;
    }
    
    /**
     * {@inheritdoc}
     */
    public function clearPattern(string $pattern): int
    {
        // Convert wildcard pattern to regex
        $regex = str_replace('*', '.*', preg_quote($pattern, '/'));
        
        $files = glob($this->cacheDir . '/*.cache');
        if ($files === false) {
            return 0;
        }
        
        $cleared = 0;
        foreach ($files as $file) {
            $filename = basename($file, '.cache');
            $key = $this->decodeKey($filename);
            
            if (preg_match("/^{$regex}$/", $key)) {
                if (@unlink($file)) {
                    $cleared++;
                }
            }
        }
        
        return $cleared;
    }
    
    /**
     * {@inheritdoc}
     */
    public function many(array $keys): array
    {
        $results = [];
        
        foreach ($keys as $key) {
            $results[$key] = $this->get($key);
        }
        
        return $results;
    }
    
    /**
     * {@inheritdoc}
     */
    public function putMany(array $values, int $ttl = 3600): bool
    {
        $success = true;
        
        foreach ($values as $key => $value) {
            if (!$this->set($key, $value, $ttl)) {
                $success = false;
            }
        }
        
        return $success;
    }
    
    /**
     * {@inheritdoc}
     */
    public function increment(string $key, int $value = 1): int|false
    {
        $current = $this->get($key);
        
        if ($current === null) {
            $current = 0;
        }
        
        if (!is_numeric($current)) {
            return false;
        }
        
        $new = (int) $current + $value;
        
        if ($this->set($key, $new)) {
            return $new;
        }
        
        return false;
    }
    
    /**
     * {@inheritdoc}
     */
    public function decrement(string $key, int $value = 1): int|false
    {
        return $this->increment($key, -$value);
    }
    
    /**
     * {@inheritdoc}
     */
    public function remember(string $key, int $ttl, callable $callback): mixed
    {
        $value = $this->get($key);
        
        if ($value !== null) {
            return $value;
        }
        
        $value = $callback();
        $this->set($key, $value, $ttl);
        
        return $value;
    }
    
    /**
     * Get file path for cache key
     * 
     * @param string $key Cache key
     * @return string Full file path
     */
    private function getFilePath(string $key): string
    {
        $safeKey = $this->encodeKey($key);
        return $this->cacheDir . '/' . $safeKey . '.cache';
    }
    
    /**
     * Encode key to safe filename
     * 
     * @param string $key Original key
     * @return string Safe filename
     */
    private function encodeKey(string $key): string
    {
        // Use MD5 hash for consistent, safe filenames
        return md5($key);
    }
    
    /**
     * Decode filename back to key (not possible with MD5, kept for interface consistency)
     * 
     * @param string $filename Encoded filename
     * @return string Decoded key (same as input for MD5)
     */
    private function decodeKey(string $filename): string
    {
        return $filename; // With MD5, we can't decode back
    }
    
    /**
     * Clean up expired cache files
     * 
     * Call this periodically to remove expired cache files.
     * 
     * @return int Number of expired files removed
     * 
     * @example
     * ```php
     * // In a cron job or scheduled task
     * $cache = new FileCache();
     * $removed = $cache->garbageCollection();
     * echo "Removed {$removed} expired cache files";
     * ```
     */
    public function garbageCollection(): int
    {
        $files = glob($this->cacheDir . '/*.cache');
        if ($files === false) {
            return 0;
        }
        
        $removed = 0;
        $now = time();
        
        foreach ($files as $file) {
            $content = @file_get_contents($file);
            if ($content === false) {
                continue;
            }
            
            $data = @unserialize($content);
            if ($data === false) {
                // Corrupted file - remove it
                @unlink($file);
                $removed++;
                continue;
            }
            
            if (isset($data['expires_at']) && $now > $data['expires_at']) {
                if (@unlink($file)) {
                    $removed++;
                }
            }
        }
        
        return $removed;
    }
    
    /**
     * Get cache statistics
     * 
     * @return array{total_files: int, total_size: int, oldest: int|null, newest: int|null}
     */
    public function getStats(): array
    {
        $files = glob($this->cacheDir . '/*.cache');
        if ($files === false) {
            return [
                'total_files' => 0,
                'total_size' => 0,
                'oldest' => null,
                'newest' => null,
            ];
        }
        
        $totalSize = 0;
        $oldest = null;
        $newest = null;
        
        foreach ($files as $file) {
            $size = filesize($file);
            $mtime = filemtime($file);
            
            if ($size !== false) {
                $totalSize += $size;
            }
            
            if ($mtime !== false) {
                if ($oldest === null || $mtime < $oldest) {
                    $oldest = $mtime;
                }
                if ($newest === null || $mtime > $newest) {
                    $newest = $mtime;
                }
            }
        }
        
        return [
            'total_files' => count($files),
            'total_size' => $totalSize,
            'oldest' => $oldest,
            'newest' => $newest,
        ];
    }
}