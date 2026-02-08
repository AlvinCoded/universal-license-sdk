<?php

declare(strict_types=1);

namespace UniversalLicense\Validation;

/**
 * Device Fingerprinting
 * 
 * Generates unique device identifiers for license validation.
 * 
 * @package UniversalLicense\Validation
 */
class DeviceFingerprint
{
    /**
     * Generate device fingerprint
     * 
     * Creates a unique identifier based on server/system information.
     * 
     * @return string Unique device fingerprint (SHA-256 hash)
     * 
     * @example
     * ```php
     * $deviceId = DeviceFingerprint::generate();
     * echo $deviceId; // "a1b2c3d4e5f6..."
     * ```
     */
    public static function generate(): string
    {
        $components = [];
        
        // Server hostname
        $hostname = gethostname();
        if ($hostname !== false) {
            $components[] = $hostname;
        } else {
            $components[] = 'unknown-host';
        }
        
        // PHP version
        $components[] = PHP_VERSION;
        
        // Operating system
        $components[] = PHP_OS;
        
        // Server software (Apache, Nginx, etc.)
        if (isset($_SERVER['SERVER_SOFTWARE'])) {
            $components[] = $_SERVER['SERVER_SOFTWARE'];
        }
        
        // Server IP address
        if (isset($_SERVER['SERVER_ADDR'])) {
            $components[] = $_SERVER['SERVER_ADDR'];
        }
        
        // Document root (unique per installation)
        if (isset($_SERVER['DOCUMENT_ROOT'])) {
            $components[] = $_SERVER['DOCUMENT_ROOT'];
        }
        
        // For CLI environments (Artisan, wp-cli, etc.)
        if (php_sapi_name() === 'cli') {
            $components[] = 'cli-mode';
            
            // Current working directory
            $cwd = getcwd();
            if ($cwd !== false) {
                $components[] = $cwd;
            }
            
            // Script filename
            if (isset($_SERVER['SCRIPT_FILENAME'])) {
                $components[] = $_SERVER['SCRIPT_FILENAME'];
            }
        }
        
        // HTTP host (for web environments)
        if (isset($_SERVER['HTTP_HOST'])) {
            $components[] = $_SERVER['HTTP_HOST'];
        }
        
        // Server name
        if (isset($_SERVER['SERVER_NAME'])) {
            $components[] = $_SERVER['SERVER_NAME'];
        }
        
        // Create fingerprint string
        $fingerprint = implode('|', $components);
        
        // Return SHA-256 hash (matches backend expectation)
        return hash('sha256', $fingerprint);
    }
    
    /**
     * Generate custom fingerprint from provided data
     * 
     * Useful for creating consistent device IDs across systems.
     * 
     * @param array<string, mixed> $data Custom data to fingerprint
     * @return string SHA-256 hash
     * 
     * @example
     * ```php
     * $deviceId = DeviceFingerprint::generateFromData([
     *     'installation_id' => 'abc-123',
     *     'site_url' => 'https://example.com',
     *     'db_prefix' => 'wp_'
     * ]);
     * ```
     */
    public static function generateFromData(array $data): string
    {
        ksort($data); // Sort for consistency
        $json = json_encode($data, JSON_THROW_ON_ERROR);
        return hash('sha256', $json);
    }
    
    /**
     * Generate fingerprint for WordPress installations
     * 
     * Creates a consistent device ID for WordPress sites.
     * 
     * @return string Device fingerprint
     */
    public static function generateForWordPress(): string
    {
        $components = [];
        
        // WordPress constants (if available)
        if (defined('ABSPATH')) {
            $components[] = ABSPATH;
        }
        
        if (defined('DB_NAME')) {
            $components[] = DB_NAME;
        }
        
        if (defined('DB_HOST')) {
            $components[] = DB_HOST;
        }
        
        if (defined('WP_SITEURL')) {
            $components[] = WP_SITEURL;
        }
        
        if (defined('WP_HOME')) {
            $components[] = WP_HOME;
        }
        
        // Site URL from WordPress options (if available)
        if (function_exists('get_option')) {
            $siteUrl = get_option('siteurl');
            if ($siteUrl) {
                $components[] = $siteUrl;
            }
        }
        
        // Fallback to standard fingerprint if no WP data available
        if (empty($components)) {
            return self::generate();
        }
        
        $fingerprint = implode('|', $components);
        return hash('sha256', $fingerprint);
    }
    
    /**
     * Generate fingerprint for Laravel installations
     * 
     * Creates a consistent device ID for Laravel applications.
     * 
     * @return string Device fingerprint
     */
    public static function generateForLaravel(): string
    {
        $components = [];
        
        // Laravel base path (if available)
        if (function_exists('base_path')) {
            $components[] = base_path();
        }
        
        // Laravel app name (from config)
        if (function_exists('config')) {
            $appName = config('app.name');
            if ($appName) {
                $components[] = $appName;
            }
            
            $appUrl = config('app.url');
            if ($appUrl) {
                $components[] = $appUrl;
            }
        }
        
        // Database connection (from config)
        if (function_exists('config')) {
            $dbConnection = config('database.default');
            $dbDatabase = config("database.connections.{$dbConnection}.database");
            
            if ($dbDatabase) {
                $components[] = $dbDatabase;
            }
        }
        
        // Fallback to standard fingerprint if no Laravel data available
        if (empty($components)) {
            return self::generate();
        }
        
        $fingerprint = implode('|', $components);
        return hash('sha256', $fingerprint);
    }
    
    /**
     * Verify device fingerprint matches current device
     * 
     * @param string $storedFingerprint Previously generated fingerprint
     * @return bool True if fingerprint matches current device
     */
    public static function verify(string $storedFingerprint): bool
    {
        $currentFingerprint = self::generate();
        return hash_equals($storedFingerprint, $currentFingerprint);
    }
    
    /**
     * Hash device ID for storage
     * 
     * @param string $deviceId Raw device ID
     * @return string SHA-256 hash
     */
    public static function hash(string $deviceId): string
    {
        return hash('sha256', $deviceId);
    }
}