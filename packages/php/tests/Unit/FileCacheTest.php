<?php

declare(strict_types=1);

namespace UniversalLicense\Tests\Unit;

use PHPUnit\Framework\TestCase;
use UniversalLicense\Cache\FileCache;

/**
 * FileCache Unit Tests
 * 
 * Tests file-based caching functionality.
 */
class FileCacheTest extends TestCase
{
    private string $cacheDir;
    private FileCache $cache;
    
    protected function setUp(): void
    {
        $this->cacheDir = sys_get_temp_dir() . '/license-cache-test-' . uniqid();
        mkdir($this->cacheDir, 0777, true);
        $this->cache = new FileCache($this->cacheDir, 3600);
    }
    
    protected function tearDown(): void
    {
        // Clean up test cache files
        $files = glob($this->cacheDir . '/*.cache');
        foreach ($files as $file) {
            unlink($file);
        }
        rmdir($this->cacheDir);
    }
    
    public function testSetAndGetValue(): void
    {
        $this->cache->set('test-key', ['data' => 'value']);
        
        $result = $this->cache->get('test-key');
        
        $this->assertNotNull($result);
        $this->assertEquals(['data' => 'value'], $result);
    }
    
    public function testGetReturnsNullForMissingKey(): void
    {
        $result = $this->cache->get('non-existent-key');
        
        $this->assertNull($result);
    }
    
    public function testHasReturnsTrueForExistingKey(): void
    {
        $this->cache->set('test-key', 'value');
        
        $this->assertTrue($this->cache->has('test-key'));
    }
    
    public function testHasReturnsFalseForMissingKey(): void
    {
        $this->assertFalse($this->cache->has('missing-key'));
    }
    
    public function testDeleteRemovesKey(): void
    {
        $this->cache->set('test-key', 'value');
        $this->cache->delete('test-key');
        
        $this->assertFalse($this->cache->has('test-key'));
    }
    
    public function testClearRemovesAllKeys(): void
    {
        $this->cache->set('key1', 'value1');
        $this->cache->set('key2', 'value2');
        
        $this->cache->clear();
        
        $this->assertFalse($this->cache->has('key1'));
        $this->assertFalse($this->cache->has('key2'));
    }
    
    public function testExpiredCacheReturnsNull(): void
    {
        // Create cache with 1 second TTL
        $shortCache = new FileCache($this->cacheDir, 1);
        $shortCache->set('expire-key', 'value');
        
        // Wait for expiration
        sleep(2);
        
        $result = $shortCache->get('expire-key');
        
        $this->assertNull($result);
    }
}