<?php

declare(strict_types=1);

namespace UniversalLicense\Laravel\Commands;

use Illuminate\Console\Command;
use UniversalLicense\LicenseClient;
use UniversalLicense\Validation\DeviceFingerprint;
use UniversalLicense\Exceptions\LicenseException;

/**
 * Validate License Artisan Command
 * 
 * Validates a license key via the command line.
 * 
 * @package UniversalLicense\Laravel\Commands
 */
class ValidateLicenseCommand extends Command
{
    /**
     * The name and signature of the console command
     * 
     * @var string
     */
    protected $signature = 'license:validate
                            {license-key? : The license key to validate}
                            {--tier= : Required tier (standard/pro/enterprise)}
                            {--features=* : Required features}';
    
    /**
     * The console command description
     * 
     * @var string
     */
    protected $description = 'Validate a license key';
    
    /**
     * License client instance
     * 
     * @var LicenseClient
     */
    protected LicenseClient $client;
    
    /**
     * Create command instance
     * 
     * @param LicenseClient $client License client
     */
    public function __construct(LicenseClient $client)
    {
        parent::__construct();
        $this->client = $client;
    }
    
    /**
     * Execute the console command
     * 
     * @return int Command exit code
     */
    public function handle(): int
    {
        $this->info('🔐 Universal License Validation');
        $this->newLine();
        
        // Get license key
        $licenseKey = $this->argument('license-key') ?? config('license.license_key');
        
        if (!$licenseKey) {
            $licenseKey = $this->ask('Enter license key');
        }
        
        if (!$licenseKey) {
            $this->error('License key is required');
            return self::FAILURE;
        }
        
        // Get validation parameters
        $requiredTier = $this->option('tier');
        $requiredFeatures = $this->option('features') ?? [];
        
        try {
            $this->info('Validating license...');
            
            // Generate device fingerprint
            $deviceId = DeviceFingerprint::generate();
            
            // Validate license
            $result = $this->client->validation->validate([
                'licenseKey' => $licenseKey,
                'deviceId' => $deviceId,
                'requiredTier' => $requiredTier,
                'requiredFeatures' => $requiredFeatures,
            ]);
            
            $this->newLine();
            
            if ($result->valid) {
                $this->info('✓ License is VALID');
                $this->newLine();
                
                // Display license details
                $license = $result->license;
                
                $this->table(
                    ['Property', 'Value'],
                    [
                        ['License Key', $license->licenseKey],
                        ['Organization', $license->orgName],
                        ['Product', $license->productCode],
                        ['Tier', strtoupper($license->tier)],
                        ['Status', strtoupper($license->status)],
                        ['Max Users', $license->maxUsers ?? 'Unlimited'],
                        ['Issued', $license->issuedAt->format('Y-m-d')],
                        ['Expires', $license->expiresAt->format('Y-m-d')],
                        ['Days Until Expiry', $license->daysUntilExpiry()],
                    ]
                );
                
                $this->newLine();
                $this->info('Features:');
                foreach ($license->features as $feature => $enabled) {
                    $this->line(($enabled ? '  ✓' : '  ✗') . " {$feature}");
                }
                
                return self::SUCCESS;
            } else {
                $this->error('✗ License validation FAILED');
                $this->newLine();
                $this->error($result->getErrorMessage());
                
                if ($result->isTierInsufficient()) {
                    $this->warn("Current tier: {$result->currentTier}");
                    $this->warn("Required tier: {$result->requiredTier}");
                }
                
                if ($result->hasMissingFeatures()) {
                    $this->warn('Missing features: ' . implode(', ', $result->missingFeatures));
                }
                
                return self::FAILURE;
            }
            
        } catch (LicenseException $e) {
            $this->error('Validation error: ' . $e->getMessage());
            
            if ($this->option('verbose')) {
                $this->error($e->getTraceAsString());
            }
            
            return self::FAILURE;
        }
    }
}