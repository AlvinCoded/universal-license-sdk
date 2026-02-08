<?php

declare(strict_types=1);

namespace UniversalLicense\Tests\Unit;

use PHPUnit\Framework\TestCase;
use UniversalLicense\Validation\LicenseValidator;
use UniversalLicense\Models\License;

/**
 * LicenseValidator Unit Tests
 * 
 * Tests client-side license validation logic.
 */
class LicenseValidatorTest extends TestCase
{
    private function createMockLicense(array $overrides = []): License
    {
        return new License(array_merge([
            'licenseKey' => 'TEST-ABC-2025-A1B2-C3D4-E5F6',
            'tier' => 'standard',
            'status' => 'active',
            'expiresAt' => date('Y-m-d H:i:s', strtotime('+30 days')),
            'features' => [
                'memberManagement' => true,
                'attendance' => true,
                'basicReporting' => true,
            ],
            'maxUsers' => 10,
            'orgName' => 'Test Org',
            'productCode' => 'TEST',
        ], $overrides));
    }
    
    public function testValidateTierAcceptsEqualTier(): void
    {
        $license = $this->createMockLicense(['tier' => 'pro']);
        
        $result = LicenseValidator::validateTier($license, 'pro');
        
        $this->assertTrue($result['valid']);
    }
    
    public function testValidateTierAcceptsHigherTier(): void
    {
        $license = $this->createMockLicense(['tier' => 'enterprise']);
        
        $result = LicenseValidator::validateTier($license, 'standard');
        
        $this->assertTrue($result['valid']);
    }
    
    public function testValidateTierRejectsLowerTier(): void
    {
        $license = $this->createMockLicense(['tier' => 'standard']);
        
        $result = LicenseValidator::validateTier($license, 'enterprise');
        
        $this->assertFalse($result['valid']);
        $this->assertEquals('standard', $result['currentTier']);
        $this->assertEquals('enterprise', $result['requiredTier']);
    }
    
    public function testValidateFeaturesAcceptsAllPresent(): void
    {
        $license = $this->createMockLicense();
        
        $result = LicenseValidator::validateFeatures($license, ['memberManagement', 'attendance']);
        
        $this->assertTrue($result['valid']);
        $this->assertEmpty($result['missingFeatures']);
    }
    
    public function testValidateFeaturesRejectsMissing(): void
    {
        $license = $this->createMockLicense();
        
        $result = LicenseValidator::validateFeatures($license, ['advancedReporting', 'financialManagement']);
        
        $this->assertFalse($result['valid']);
        $this->assertContains('advancedReporting', $result['missingFeatures']);
        $this->assertContains('financialManagement', $result['missingFeatures']);
    }
    
    public function testIsExpiredReturnsFalseForValidLicense(): void
    {
        $license = $this->createMockLicense([
            'expiresAt' => date('Y-m-d H:i:s', strtotime('+30 days'))
        ]);
        
        $this->assertFalse(LicenseValidator::isExpired($license));
    }
    
    public function testIsExpiredReturnsTrueForExpiredLicense(): void
    {
        $license = $this->createMockLicense([
            'expiresAt' => date('Y-m-d H:i:s', strtotime('-1 day'))
        ]);
        
        $this->assertTrue(LicenseValidator::isExpired($license));
    }
    
    public function testIsActiveLicenseReturnsTrueForActive(): void
    {
        $license = $this->createMockLicense([
            'status' => 'active',
            'expiresAt' => date('Y-m-d H:i:s', strtotime('+30 days'))
        ]);
        
        $this->assertTrue(LicenseValidator::isActiveLicense($license));
    }
    
    public function testIsActiveLicenseReturnsFalseForExpired(): void
    {
        $license = $this->createMockLicense([
            'status' => 'active',
            'expiresAt' => date('Y-m-d H:i:s', strtotime('-1 day'))
        ]);
        
        $this->assertFalse(LicenseValidator::isActiveLicense($license));
    }
    
    public function testIsActiveLicenseReturnsFalseForRevoked(): void
    {
        $license = $this->createMockLicense([
            'status' => 'revoked',
            'expiresAt' => date('Y-m-d H:i:s', strtotime('+30 days'))
        ]);
        
        $this->assertFalse(LicenseValidator::isActiveLicense($license));
    }
}