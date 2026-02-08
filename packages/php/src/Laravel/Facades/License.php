<?php

declare(strict_types=1);

namespace UniversalLicense\Laravel\Facades;

use Illuminate\Support\Facades\Facade;
use UniversalLicense\LicenseClient;

/**
 * License Facade
 * 
 * Provides static access to the LicenseClient instance.
 * 
 * @package UniversalLicense\Laravel\Facades
 * 
 * @method static \UniversalLicense\Modules\ValidationModule validation()
 * @method static \UniversalLicense\Modules\LicenseModule licenses()
 * @method static \UniversalLicense\Modules\ProductModule products()
 * @method static \UniversalLicense\Modules\PurchaseModule purchases()
 * @method static \UniversalLicense\Modules\AuthModule auth()
 * @method static \UniversalLicense\Modules\OrganizationModule organizations()
 * @method static \UniversalLicense\Modules\PlanModule plans()
 * @method static \UniversalLicense\Modules\PaymentModule payment()
 * @method static \UniversalLicense\Modules\ImportModule import()
 * @method static \UniversalLicense\Modules\ExportModule export()
 * @method static \UniversalLicense\Modules\HealthModule health()
 * @method static \UniversalLicense\Modules\RenewalModule renewal()
 * @method static \UniversalLicense\Modules\ActivityModule activity()
 * @method static \UniversalLicense\Models\ValidationResult validate(array $params)
 * @method static array getAll()
 * @method static \UniversalLicense\Models\License|null get(string $licenseKey)
 * @method static bool testConnection()
 * 
 * @see \UniversalLicense\LicenseClient
 */
class License extends Facade
{
    /**
     * Get the registered name of the component
     * 
     * @return string
     */
    protected static function getFacadeAccessor(): string
    {
        return 'license';
    }
}