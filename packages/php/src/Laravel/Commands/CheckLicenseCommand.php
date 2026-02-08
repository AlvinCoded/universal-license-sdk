<?php

declare(strict_types=1);

namespace UniversalLicense\Laravel\Commands;

use Illuminate\Console\Command;
use UniversalLicense\LicenseClient;
use UniversalLicense\Validation\DeviceFingerprint;

/**
 * Check License Command
 * 
 * Quick check if the configured license is valid.
 * 
 * @package UniversalLicense\Laravel\Commands
 */
class CheckLicenseCommand extends Command
{
    /**
     * The name and signature of the console command
     * 
     * @var string
     */
    protected $signature = 'license:check';
    
    /**
     * The console command description
     * 
     * @var string
     */
    protected $description = 'Check if the configured license is valid';
    
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
        $licenseKey = config('license.license_key');
        
        if (!$licenseKey) {
            $this->error('No license key configured');
            $this->info('Set LICENSE_KEY in your .env file');
            return self::FAILURE;
        }
        
        $this->info("Checking license: {$licenseKey}");
        
        try {
            $deviceId = DeviceFingerprint::generate();
            
            $result = $this->client->validation->validate([
                'licenseKey' => $licenseKey,
                'deviceId' => $deviceId,
            ]);
            
            if ($result->valid) {
                $this->info('✓ License is valid');
                $this->line("  Organization: {$result->license->orgName}");
                $this->line("  Tier: {$result->license->tier}");
                $this->line("  Expires: {$result->license->expiresAt->format('Y-m-d')}");
                return self::SUCCESS;
            } else {
                $this->error('✗ License is invalid');
                $this->error("  Reason: {$result->getErrorMessage()}");
                return self::FAILURE;
            }
        } catch (\Exception $e) {
            $this->error('Check failed: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}