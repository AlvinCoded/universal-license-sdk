<?php

declare(strict_types=1);

namespace UniversalLicense\Tests\Unit;

use PHPUnit\Framework\TestCase;
use UniversalLicense\LicenseClient;
use UniversalLicense\Config\LicenseConfig;

/**
 * LicenseClient Unit Tests
 * 
 * Tests the main client initialization and configuration.
 */
class LicenseClientTest extends TestCase
{
    public function testClientInstantiationWithDefaults(): void
    {
        $client = new LicenseClient([
            'baseUrl' => 'http://localhost:3001/api',
        ]);
        
        $this->assertInstanceOf(LicenseClient::class, $client);
    }
    
    public function testClientInstantiationWithCustomConfig(): void
    {
        $client = new LicenseClient([
            'baseUrl' => 'https://license-server.com/api',
            'timeout' => 60,
            'retries' => 5,
            'cache' => false,
            'debug' => true,
        ]);
        
        $config = $client->getConfig();
        
        $this->assertEquals('https://license-server.com/api', $config->getBaseUrl());
        $this->assertEquals(60, $config->getTimeout());
        $this->assertEquals(5, $config->getRetries());
        $this->assertFalse($config->isCacheEnabled());
        $this->assertTrue($config->isDebugEnabled());
    }
    
    public function testClientThrowsExceptionForMissingBaseUrl(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Base URL is required');
        
        new LicenseClient([]);
    }
    
    public function testClientProvidesAccessToModules(): void
    {
        $client = new LicenseClient([
            'baseUrl' => 'http://localhost:3001/api',
        ]);
        
        $this->assertInstanceOf(\UniversalLicense\Modules\ValidationModule::class, $client->validation);
        $this->assertInstanceOf(\UniversalLicense\Modules\LicenseModule::class, $client->licenses);
        $this->assertInstanceOf(\UniversalLicense\Modules\ProductModule::class, $client->products);
        $this->assertInstanceOf(\UniversalLicense\Modules\PurchaseModule::class, $client->purchases);
    }
}