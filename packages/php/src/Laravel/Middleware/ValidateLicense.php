<?php

declare(strict_types=1);

namespace UniversalLicense\Laravel\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use UniversalLicense\LicenseClient;
use UniversalLicense\Validation\DeviceFingerprint;
use UniversalLicense\Exceptions\ValidationException;

/**
 * Validate License Middleware
 * 
 * Validates that the incoming request has a valid license.
 * Can be applied to routes or controllers to protect features.
 * 
 * @package UniversalLicense\Laravel\Middleware
 * 
 * @example
 * ```php
 * // In routes/web.php
 * Route::middleware('license')->group(function () {
 *     Route::get('/dashboard', [DashboardController::class, 'index']);
 * });
 * 
 * // With parameters
 * Route::get('/reports', [ReportController::class, 'index'])
 *     ->middleware('license:pro,advancedReporting');
 * ```
 */
class ValidateLicense
{
    /**
     * License client instance
     * 
     * @var LicenseClient
     */
    protected LicenseClient $client;
    
    /**
     * Create middleware instance
     * 
     * @param LicenseClient $client License client
     */
    public function __construct(LicenseClient $client)
    {
        $this->client = $client;
    }
    
    /**
     * Handle an incoming request
     * 
     * @param Request $request Request instance
     * @param Closure $next Next middleware
     * @param string|null $tier Required tier (optional)
     * @param string|null $features Comma-separated required features (optional)
     * @return Response
     */
    public function handle(Request $request, Closure $next, ?string $tier = null, ?string $features = null): Response
    {
        // Get license key from session or config
        $licenseKey = session('license_key') ?? config('license.license_key');
        
        if (!$licenseKey) {
            return $this->unauthorized($request, 'No license key found. Please configure your license.');
        }
        
        try {
            // Generate device fingerprint
            $deviceId = DeviceFingerprint::generate();
            
            // Parse features
            $requiredFeatures = $features ? explode(',', $features) : [];
            
            // Validate license
            $result = $this->client->validation->validate([
                'licenseKey' => $licenseKey,
                'deviceId' => $deviceId,
                'requiredTier' => $tier,
                'requiredFeatures' => $requiredFeatures,
            ]);
            
            if (!$result->valid) {
                return $this->validationFailed($request, $result);
            }
            
            // Store license info in request for access in controllers
            $request->attributes->set('license', $result->license);
            $request->attributes->set('license_validation', $result);
            
            // Store in session for convenience
            session(['license' => $result->license]);
            
            return $next($request);
            
        } catch (ValidationException $e) {
            return $this->validationFailed($request, null, $e);
        } catch (\Exception $e) {
            return $this->error($request, 'License validation error: ' . $e->getMessage());
        }
    }
    
    /**
     * Handle unauthorized access (no license key)
     * 
     * @param Request $request Request instance
     * @param string $message Error message
     * @return Response
     */
    protected function unauthorized(Request $request, string $message): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => $message,
            ], 401);
        }
        
        return response()->view('license::unauthorized', [
            'message' => $message,
        ], 401);
    }
    
    /**
     * Handle validation failure
     * 
     * @param Request $request Request instance
     * @param \UniversalLicense\Models\ValidationResult|null $result Validation result
     * @param ValidationException|null $exception Exception if thrown
     * @return Response
     */
    protected function validationFailed(
        Request $request,
        $result = null,
        ?ValidationException $exception = null
    ): Response {
        $message = $exception ? $exception->getUserMessage() : ($result ? $result->getErrorMessage() : 'License validation failed');
        
        if ($request->expectsJson()) {
            $data = [
                'error' => 'License Validation Failed',
                'message' => $message,
            ];
            
            if ($result) {
                $data['details'] = [
                    'currentTier' => $result->currentTier,
                    'requiredTier' => $result->requiredTier,
                    'missingFeatures' => $result->missingFeatures,
                ];
            }
            
            return response()->json($data, 403);
        }
        
        return response()->view('license::validation-failed', [
            'message' => $message,
            'result' => $result,
            'exception' => $exception,
        ], 403);
    }
    
    /**
     * Handle general error
     * 
     * @param Request $request Request instance
     * @param string $message Error message
     * @return Response
     */
    protected function error(Request $request, string $message): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Error',
                'message' => $message,
            ], 500);
        }
        
        return response()->view('license::error', [
            'message' => $message,
        ], 500);
    }
}