<?php

declare(strict_types=1);

namespace UniversalLicense\Laravel\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Check Feature Middleware
 * 
 * Checks if the current license has specific features enabled.
 * Must be used after ValidateLicense middleware.
 * 
 * @package UniversalLicense\Laravel\Middleware
 * 
 * @example
 * ```php
 * // In routes/web.php
 * Route::middleware(['license', 'license.feature:advancedReporting'])->group(function () {
 *     Route::get('/reports', [ReportController::class, 'index']);
 * });
 * 
 * // Multiple features (requires ALL)
 * Route::middleware(['license', 'license.feature:multiLocation,financialManagement'])
 *     ->get('/financial-reports', [FinancialController::class, 'reports']);
 * ```
 */
class CheckFeature
{
    /**
     * Handle an incoming request
     * 
     * @param Request $request Request instance
     * @param Closure $next Next middleware
     * @param string ...$features Required features (comma-separated or multiple params)
     * @return Response
     */
    public function handle(Request $request, Closure $next, string ...$features): Response
    {
        // Flatten features (handle both comma-separated and multiple parameters)
        $requiredFeatures = [];
        foreach ($features as $feature) {
            $requiredFeatures = array_merge($requiredFeatures, explode(',', $feature));
        }
        $requiredFeatures = array_map('trim', $requiredFeatures);
        
        // Get license from request (set by ValidateLicense middleware)
        $license = $request->attributes->get('license');
        
        if (!$license) {
            return $this->featureDenied(
                $request,
                'License validation required. Apply ValidateLicense middleware first.'
            );
        }
        
        // Check if all required features are enabled
        $missingFeatures = [];
        foreach ($requiredFeatures as $feature) {
            if (!$license->hasFeature($feature)) {
                $missingFeatures[] = $feature;
            }
        }
        
        if (!empty($missingFeatures)) {
            return $this->featureDenied(
                $request,
                'This feature requires: ' . implode(', ', $missingFeatures),
                $missingFeatures
            );
        }
        
        return $next($request);
    }
    
    /**
     * Handle feature access denied
     * 
     * @param Request $request Request instance
     * @param string $message Error message
     * @param array<string> $missingFeatures Missing features
     * @return Response
     */
    protected function featureDenied(Request $request, string $message, array $missingFeatures = []): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Feature Access Denied',
                'message' => $message,
                'missingFeatures' => $missingFeatures,
            ], 403);
        }
        
        return response()->view('license::feature-denied', [
            'message' => $message,
            'missingFeatures' => $missingFeatures,
        ], 403);
    }
}