<?php

declare(strict_types=1);

namespace UniversalLicense\Laravel\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Check Tier Middleware
 * 
 * Checks if the current license meets the minimum tier requirement.
 * Must be used after ValidateLicense middleware.
 * 
 * @package UniversalLicense\Laravel\Middleware
 * 
 * @example
 * ```php
 * // In routes/web.php
 * Route::middleware(['license', 'license.tier:pro'])->group(function () {
 *     Route::get('/pro-features', [ProController::class, 'index']);
 * });
 * 
 * // Enterprise features
 * Route::middleware(['license', 'license.tier:enterprise'])
 *     ->get('/enterprise-analytics', [AnalyticsController::class, 'index']);
 * ```
 */
class CheckTier
{
    /**
     * Tier hierarchy for comparison
     * 
     * @var array<string, int>
     */
    protected array $tierHierarchy = [
        'standard' => 1,
        'pro' => 2,
        'enterprise' => 3,
    ];
    
    /**
     * Handle an incoming request
     * 
     * @param Request $request Request instance
     * @param Closure $next Next middleware
     * @param string $requiredTier Required minimum tier
     * @return Response
     */
    public function handle(Request $request, Closure $next, string $requiredTier): Response
    {
        // Get license from request (set by ValidateLicense middleware)
        $license = $request->attributes->get('license');
        
        if (!$license) {
            return $this->tierDenied(
                $request,
                'License validation required. Apply ValidateLicense middleware first.'
            );
        }
        
        // Get current and required tier levels
        $currentTier = strtolower($license->tier);
        $requiredTierNormalized = strtolower($requiredTier);
        
        $currentLevel = $this->tierHierarchy[$currentTier] ?? 0;
        $requiredLevel = $this->tierHierarchy[$requiredTierNormalized] ?? 0;
        
        // Check if current tier meets requirement
        if ($currentLevel < $requiredLevel) {
            return $this->tierDenied(
                $request,
                "This feature requires {$requiredTierNormalized} tier or higher (current: {$currentTier})",
                $currentTier,
                $requiredTierNormalized
            );
        }
        
        return $next($request);
    }
    
    /**
     * Handle tier access denied
     * 
     * @param Request $request Request instance
     * @param string $message Error message
     * @param string|null $currentTier Current tier
     * @param string|null $requiredTier Required tier
     * @return Response
     */
    protected function tierDenied(
        Request $request,
        string $message,
        ?string $currentTier = null,
        ?string $requiredTier = null
    ): Response {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Tier Access Denied',
                'message' => $message,
                'currentTier' => $currentTier,
                'requiredTier' => $requiredTier,
            ], 403);
        }
        
        return response()->view('license::tier-denied', [
            'message' => $message,
            'currentTier' => $currentTier,
            'requiredTier' => $requiredTier,
        ], 403);
    }
}