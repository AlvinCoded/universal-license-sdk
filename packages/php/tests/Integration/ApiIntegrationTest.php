<?php

declare(strict_types=1);

namespace UniversalLicense\Tests\Integration;

use PHPUnit\Framework\TestCase;
use UniversalLicense\LicenseClient;
use UniversalLicense\Validation\DeviceFingerprint;
use UniversalLicense\Exceptions\{ValidationException, ApiException};

/**
 * API Integration Tests
 * 
 * Tests real API communication with the license server.
 * 
 * @group integration
 * @group requires-server
 */
class ApiIntegrationTest extends TestCase
{
    private LicenseClient $client;
    private string $serverUrl;
    
    protected function setUp(): void
    {
        $this->serverUrl = getenv('LICENSE_SERVER_URL') ?: 'http://localhost:3001/api';
        
        $this->client = new LicenseClient([
            'baseUrl' => $this->serverUrl,
            'timeout' => 10,
            'cache' => false,
        ]);
        
        // Skip if server is not available
        try {
            $this->client->testConnection();
        } catch (\Exception $e) {
            $this->markTestSkipped('License server is not available: ' . $e->getMessage());
        }
    }
    
    public function testServerHealthCheck(): void
    {
        $health = $this->client->testConnection();
        
        $this->assertTrue($health['healthy']);
        $this->assertArrayHasKey('latency', $health);
        $this->assertIsInt($health['latency']);
    }
    
    public function testGetAllProducts(): void
    {
        $products = $this->client->products->getAll();
        
        $this->assertIsArray($products);
        
        if (count($products) > 0) {
            $this->assertArrayHasKey('productCode', $products[0]->toArray());
            $this->assertArrayHasKey('productName', $products[0]->toArray());
        }
    }
    
    public function testGetProductPlans(): void
    {
        $products = $this->client->products->getAll();
        
        if (count($products) === 0) {
            $this->markTestSkipped('No products available for testing');
        }
        
        $productCode = $products[0]->productCode;
        $plans = $this->client->products->getPlans($productCode);
        
        $this->assertIsArray($plans);
    }
    
    public function testValidateInvalidLicenseKey(): void
    {
        $deviceId = DeviceFingerprint::generate();
        
        $result = $this->client->validation->validate([
            'licenseKey' => 'INVALID-KEY-FORMAT',
            'deviceId' => $deviceId,
        ]);
        
        $this->assertFalse($result->valid);
        $this->assertNotEmpty($result->error);
    }
    
    public function testValidateNonExistentLicenseKey(): void
    {
        $deviceId = DeviceFingerprint::generate();
        
        $result = $this->client->validation->validate([
            'licenseKey' => 'TEST-XXX-9999-AAAA-BBBB-CCCC',
            'deviceId' => $deviceId,
        ]);
        
        $this->assertFalse($result->valid);
        $this->assertStringContainsStringIgnoringCase('not found', $result->error ?? '');
    }
    
    /**
     * @depends testGetAllProducts
     */
    public function testCompleteWorkflowWithRealServer(): void
    {
        // This test requires a valid license in the database
        // Skip if no test license is configured
        $testLicenseKey = getenv('TEST_LICENSE_KEY');
        
        if (!$testLicenseKey) {
            $this->markTestSkipped('No TEST_LICENSE_KEY configured for integration testing');
        }
        
        $deviceId = DeviceFingerprint::generate();
        
        // Validate license
        $result = $this->client->validation->validate([
            'licenseKey' => $testLicenseKey,
            'deviceId' => $deviceId,
        ]);
        
        if ($result->valid) {
            // Assert license data structure
            $this->assertNotNull($result->license);
            $this->assertEquals($testLicenseKey, $result->license->licenseKey);
            $this->assertContains($result->license->status, ['active', 'pending']);
            $this->assertIsArray($result->license->features);
        } else {
            // License might be expired or revoked - that's okay for testing
            $this->assertNotEmpty($result->error);
        }
    }
}