<?php

declare(strict_types=1);

namespace UniversalLicense\Laravel\Commands;

use Illuminate\Console\Command;
use UniversalLicense\LicenseClient;

/**
 * License Info Artisan Command
 * 
 * Display license information and SDK configuration.
 * 
 * @package UniversalLicense\Laravel\Commands
 */
class LicenseInfoCommand extends Command
{
    /**
     * The name and signature of the console command
     * 
     * @var string
     */
    protected $signature = 'license:info';
    
    /**
     * The console command description
     * 
     * @var string
     */
    protected $description = 'Display license configuration and status';
    
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
        $this->info('📋 Universal License SDK Configuration');
        $this->newLine();
        
        $config = config('license');
        
        // Display configuration
        $this->table(
            ['Setting', 'Value'],
            [
                ['Server URL', $config['server_url']],
                ['Timeout', $config['timeout'] . 's'],
                ['Retries', $config['retries']],
                ['Cache Enabled', $config['cache']['enabled'] ? 'Yes' : 'No'],
                ['Cache Driver', $config['cache']['driver'] ?? 'default'],
                ['Cache TTL', $config['cache']['ttl'] . 's'],
                ['Debug Mode', $config['debug'] ? 'Yes' : 'No'],
            ]
        );
        
        // Test connection
        $this->newLine();
        $this->info('Testing connection to license server...');
        
        try {
            $health = $this->client->testConnection();
            
            if ($health['healthy']) {
                $this->info("✓ Server is healthy (latency: {$health['latency']}ms)");
            } else {
                $this->error('✗ Server is not responding');
            }
        } catch (\Exception $e) {
            $this->error('Connection failed: ' . $e->getMessage());
        }
        
        // Display license key (if configured)
        $this->newLine();
        $licenseKey = $config['license_key'] ?? null;
        
        if ($licenseKey) {
            $this->info('Configured License Key: ' . $licenseKey);
        } else {
            $this->warn('No license key configured');
        }
        
        return self::SUCCESS;
    }
}