<?php

declare(strict_types=1);

namespace UniversalLicense\Tests\Integration;

use PHPUnit\Framework\TestCase;
use UniversalLicense\LicenseClient;
use UniversalLicense\Validation\DeviceFingerprint;

/**
 * Validation Workflow Integration Tests
 * 
 * Tests complete license validation workflows.
 * 
 * @group integration
 * @group requires-server
 */
class ValidationWorkflowTest extends TestCase
{
    private LicenseClient $client;
    
    protected function setUp(): void
    {
        $serverUrl = getenv('LICENSE_SERVER_URL') ?: 'http://localhost:3001/api';
        
        $this->client = new LicenseClient([
            'baseUrl' => $serverUrl,
            'cache' => true,
            'timeout' => 10,
        ]);
        
        try {
            $this->client->testConnection();
        } catch (\Exception $e) {
            $this->markTestSkipped('License server is not available');
        }
    }
    
    public function testValidationWithTierRequirement(): void
    {
        $testLicenseKey = getenv('TEST_LICENSE_KEY');
        
        if (!$testLicenseKey) {
            $this->markTestSkipped('No TEST_LICENSE_KEY configured');
        }
        
        $deviceId = DeviceFingerprint::generate();
        
        // Test with standard tier requirement
        $result = $this->client->validation->validate([
            'licenseKey' => $testLicenseKey,
            'deviceId' => $deviceId,
            'requiredTier' => 'standard',
        ]);
        
        // If license is active, it should meet standard tier
        if ($result->license && $result->license->status === 'active') {
            $this->assertTrue(
                in_array($result->license->tier, ['standard', 'pro', 'enterprise'])
            );
        }
    }
    
    public function testValidationWithFeatureRequirement(): void
    {
        $testLicenseKey = getenv('TEST_LICENSE_KEY');
        
        if (!$testLicenseKey) {
            $this->markTestSkipped('No TEST_LICENSE_KEY configured');
        }
        
        $deviceId = DeviceFingerprint::generate();
        
        // First, get license to see what features it has
        $result = $this->client->validation->validate([
            'licenseKey' => $testLicenseKey,
            'deviceId' => $deviceId,
        ]);
        
        if ($result->valid && $result->license) {
            $availableFeatures = array_keys(
                array_filter($result->license->features, fn($enabled) => $enabled === true)
            );
            
            if (count($availableFeatures) > 0) {
                // Test validation with a feature that exists
                $testFeature = $availableFeatures[0];
                
                $result2 = $this->client->validation->validate([
                    'licenseKey' => $testLicenseKey,
                    'deviceId' => $deviceId,
                    'requiredFeatures' => [$testFeature],
                ]);
                
                $this->assertTrue($result2->valid);
            }
        }
    }
    
    public function testConsecutiveValidationsUseCacheWhenEnabled(): void
    {
        $testLicenseKey = getenv('TEST_LICENSE_KEY');
        
        if (!$testLicenseKey) {
            $this->markTestSkipped('No TEST_LICENSE_KEY configured');
        }
        
        $deviceId = DeviceFingerprint::generate();
        
        // First validation
        $start1 = microtime(true);
        $result1 = $this->client->validation->validate([
            'licenseKey' => $testLicenseKey,
            'deviceId' => $deviceId,
        ]);
        $time1 = (microtime(true) - $start1) * 1000;
        
        // Second validation (should be cached)
        $start2 = microtime(true);
        $result2 = $this->client->validation->validate([
            'licenseKey' => $testLicenseKey,
            'deviceId' => $deviceId,
        ]);
        $time2 = (microtime(true) - $start2) * 1000;
        
        // Cache should make second request significantly faster
        // (at least 50% faster)
        $this->assertLessThan($time1 * 0.5, $time2);
        
        // Results should be identical
        $this->assertEquals($result1->valid, $result2->valid);
    }
}