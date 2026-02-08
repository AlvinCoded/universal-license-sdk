<?php

declare(strict_types=1);

namespace UniversalLicense\Laravel\Commands;

use Illuminate\Console\Command;
use UniversalLicense\LicenseClient;

/**
 * Cache Clear Artisan Command
 * 
 * Clears the license cache.
 * 
 * @package UniversalLicense\Laravel\Commands
 */
class CacheClearCommand extends Command
{
    /**
     * The name and signature of the console command
     * 
     * @var string
     */
    protected $signature = 'license:cache-clear
                            {--pattern= : Clear only keys matching pattern (e.g., "license:*")}';
    
    /**
     * The console command description
     * 
     * @var string
     */
    protected $description = 'Clear the license cache';
    
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
        $pattern = $this->option('pattern');
        
        $this->info('🗑️  Clearing license cache...');
        
        try {
            $cache = $this->client->getCache();
            
            if (!$cache) {
                $this->warn('Cache is not enabled');
                return self::FAILURE;
            }
            
            if ($pattern) {
                $cleared = $cache->clearPattern($pattern);
                $this->info("✓ Cleared {$cleared} cache entries matching '{$pattern}'");
            } else {
                $cache->clear();
                $this->info('✓ License cache cleared successfully');
            }
            
            return self::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error('Failed to clear cache: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}