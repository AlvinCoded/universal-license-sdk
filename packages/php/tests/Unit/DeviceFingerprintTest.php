<?php

declare(strict_types=1);

namespace UniversalLicense\Tests\Unit;

use PHPUnit\Framework\TestCase;
use UniversalLicense\Validation\DeviceFingerprint;

/**
 * DeviceFingerprint Unit Tests
 * 
 * Tests device fingerprint generation consistency.
 */
class DeviceFingerprintTest extends TestCase
{
    public function testGenerateReturnsConsistentFingerprint(): void
    {
        $fingerprint1 = DeviceFingerprint::generate();
        $fingerprint2 = DeviceFingerprint::generate();
        
        // Should be consistent across calls
        $this->assertEquals($fingerprint1, $fingerprint2);
        $this->assertNotEmpty($fingerprint1);
    }
    
    public function testGenerateReturnsSha256Hash(): void
    {
        $fingerprint = DeviceFingerprint::generate();
        
        // SHA-256 produces 64 character hex string
        $this->assertEquals(64, strlen($fingerprint));
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/i', $fingerprint);
    }
    
    public function testGenerateWithCustomComponents(): void
    {
        $components = [
            'custom-hostname',
            '192.168.1.1',
            'custom-os',
        ];
        
        $fingerprint = DeviceFingerprint::generateFromComponents($components);
        
        $this->assertNotEmpty($fingerprint);
        $this->assertEquals(64, strlen($fingerprint));
    }
    
    public function testDifferentEnvironmentsProduceDifferentFingerprints(): void
    {
        $components1 = ['host1', 'os1'];
        $components2 = ['host2', 'os2'];
        
        $fingerprint1 = DeviceFingerprint::generateFromComponents($components1);
        $fingerprint2 = DeviceFingerprint::generateFromComponents($components2);
        
        $this->assertNotEquals($fingerprint1, $fingerprint2);
    }
}