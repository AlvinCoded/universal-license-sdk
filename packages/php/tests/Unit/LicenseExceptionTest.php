<?php

declare(strict_types=1);

namespace UniversalLicense\Tests\Unit;

use PHPUnit\Framework\TestCase;
use UniversalLicense\Exceptions\{
    LicenseException,
    ValidationException,
    ApiException,
    ConfigurationException
};

/**
 * LicenseException Unit Tests
 * 
 * Tests exception handling and error messages.
 */
class LicenseExceptionTest extends TestCase
{
    public function testLicenseExceptionHoldsErrorCode(): void
    {
        $exception = new LicenseException('Test error', 'TEST_ERROR');
        
        $this->assertEquals('Test error', $exception->getMessage());
        $this->assertEquals('TEST_ERROR', $exception->getErrorCode());
    }
    
    public function testLicenseExceptionHoldsDetails(): void
    {
        $exception = new LicenseException('Test error', 'TEST_ERROR', [
            'key' => 'value',
            'count' => 42,
        ]);
        
        $details = $exception->getDetails();
        
        $this->assertEquals('value', $details['key']);
        $this->assertEquals(42, $details['count']);
    }
    
    public function testValidationExceptionCreatesExpiredInstance(): void
    {
        $exception = ValidationException::expired('TEST-KEY', new \DateTime('2025-01-15'));
        
        $this->assertEquals('LICENSE_EXPIRED', $exception->getErrorCode());
        $this->assertTrue($exception->isExpired());
        $this->assertFalse($exception->isRevoked());
    }
    
    public function testValidationExceptionCreatesRevokedInstance(): void
    {
        $exception = ValidationException::revoked('TEST-KEY', 'Payment dispute');
        
        $this->assertEquals('LICENSE_REVOKED', $exception->getErrorCode());
        $this->assertTrue($exception->isRevoked());
        $this->assertEquals('Payment dispute', $exception->getDetail('revokeReason'));
    }
    
    public function testValidationExceptionCreatesTierInsufficientInstance(): void
    {
        $exception = ValidationException::insufficientTier('standard', 'pro');
        
        $this->assertTrue($exception->isTierInsufficient());
        $this->assertEquals('standard', $exception->getCurrentTier());
        $this->assertEquals('pro', $exception->getRequiredTier());
    }
    
    public function testValidationExceptionCreatesMissingFeaturesInstance(): void
    {
        $exception = ValidationException::missingFeatures(['feature1', 'feature2']);
        
        $this->assertTrue($exception->hasMissingFeatures());
        $this->assertEquals(['feature1', 'feature2'], $exception->getMissingFeatures());
    }
    
    public function testApiExceptionCreatesNetworkErrorInstance(): void
    {
        $exception = ApiException::networkError('Could not connect', 'http://test.com');
        
        $this->assertEquals('NETWORK_ERROR', $exception->getErrorCode());
        $this->assertTrue($exception->isRetryable());
        $this->assertEquals('http://test.com', $exception->getUrl());
    }
    
    public function testApiExceptionCreatesTimeoutInstance(): void
    {
        $exception = ApiException::timeout(30);
        
        $this->assertEquals('TIMEOUT', $exception->getErrorCode());
        $this->assertTrue($exception->isRetryable());
        $this->assertEquals(30, $exception->getDetail('timeout'));
    }
    
    public function testConfigurationExceptionCreatesInstance(): void
    {
        $exception = ConfigurationException::missing('baseUrl');
        
        $this->assertEquals('CONFIG_MISSING', $exception->getErrorCode());
        $this->assertFalse($exception->isRetryable());
        $this->assertEquals('baseUrl', $exception->getDetail('configKey'));
    }
}