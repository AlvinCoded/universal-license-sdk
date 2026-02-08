import type { HttpClient } from '../http/HttpClient';
import type { LicenseCache } from '../cache/LicenseCache';
import type { LicenseTier, ValidateLicenseRequest, ValidateLicenseResponse } from '@unilic/core';
import type { PublicKeySetResponse } from '@unilic/core';
import { API_ENDPOINTS } from '@unilic/core';
import { DeviceFingerprint } from '@unilic/core';

/**
 * License validation operations
 * POST /api/licenses/validate
 */
export class ValidationModule {
  constructor(
    private http: HttpClient,
    private cache?: LicenseCache
  ) {}

  /**
   * Validate license with full options
   * POST /api/licenses/validate
   *
   * @example
   * ```typescript
   * // In your application's onboarding or startup
   * const result = await client.validation.validate({
   *   licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
   *   deviceId: await DeviceFingerprint.generate(),
   *   requiredTier: 'pro',
   *   requiredFeatures: ['advancedReporting', 'financialManagement']
   * });
   *
   * if (result.valid) {
   *   console.log('License valid!');
   *   console.log('Tier:', result.license.tier);
   *   console.log('Features:', result.license.features);
   *   console.log('Max Users:', result.license.maxUsers);
   *
   *   // Enable application features
   *   enableFeatures(result.license.features);
   * } else {
   *   console.error('Invalid:', result.error);
   *   // Show upgrade prompt or error
   * }
   * ```
   */
  async validate(request: ValidateLicenseRequest): Promise<ValidateLicenseResponse> {
    // Check cache first (if enabled)
    if (this.cache) {
      const cached = await this.cache.getValidation(request.licenseKey, request.deviceId);

      if (cached && cached.valid) {
        // Verify cached result is still current
        const license = cached.license;
        const notExpired = license?.expiresAt ? new Date(license.expiresAt) > new Date() : true;

        if (notExpired) {
          return cached;
        }
      }
    }

    // Perform validation
    const result = await this.http.post<ValidateLicenseResponse>(
      API_ENDPOINTS.LICENSES.VALIDATE,
      request
    );

    // Cache the result
    if (this.cache && result.valid) {
      await this.cache.cacheValidation(request.licenseKey, request.deviceId, result);
    }

    return result;
  }

  /**
   * Simple validation (auto-generates device ID)
   *
   * @example
   * ```typescript
   * const result = await client.validation.validateSimple(
   *   'PROD-ORG-2025-XXXX-XXXX-XXXX'
   * );
   *
   * if (result.valid) {
   *   console.log('Valid license!');
   * }
   * ```
   */
  async validateSimple(licenseKey: string): Promise<ValidateLicenseResponse> {
    const deviceId = await DeviceFingerprint.generate();
    return this.validate({ licenseKey, deviceId });
  }

  /**
   * Validate with feature requirements
   *
   * @example
   * ```typescript
   * const canUseFeature = await client.validation.validateFeatures(
   *   licenseKey,
   *   ['multiLocation', 'advancedReporting']
   * );
   *
   * if (!canUseFeature.valid) {
   *   showUpgradePrompt(canUseFeature.missingFeatures);
   * }
   * ```
   */
  async validateFeatures(
    licenseKey: string,
    requiredFeatures: string[]
  ): Promise<ValidateLicenseResponse> {
    const deviceId = await DeviceFingerprint.generate();
    return this.validate({
      licenseKey,
      deviceId,
      requiredFeatures,
    });
  }

  /**
   * Validate with tier requirement
   *
   * @example
   * ```typescript
   * const canAccess = await client.validation.validateTier(
   *   licenseKey,
   *   'pro'
   * );
   *
   * if (!canAccess.valid && canAccess.currentTier === 'standard') {
   *   showUpgradePrompt('pro');
   * }
   * ```
   */
  async validateTier(
    licenseKey: string,
    requiredTier: LicenseTier
  ): Promise<ValidateLicenseResponse> {
    const deviceId = await DeviceFingerprint.generate();
    return this.validate({
      licenseKey,
      deviceId,
      requiredTier,
    });
  }

  /**
   * Check if cached license is still valid (offline check)
   */
  async isValidCached(licenseKey: string): Promise<boolean> {
    if (!this.cache) return false;

    const license = await this.cache.get(licenseKey);
    if (!license) return false;

    return license.status === 'active' && new Date(license.expires_at) > new Date();
  }

  /**
   * Get RSA public key for signature verification
   * GET /api/licenses/keys/public
   */
  async getPublicKey(): Promise<string> {
    const response = await this.http.get<{ publicKey: string }>(API_ENDPOINTS.LICENSES.PUBLIC_KEY);
    return response.publicKey;
  }

  /**
   * Get RSA public key set for signature verification (rotation-aware)
   * GET /api/licenses/keys/public
   */
  async getPublicKeySet(): Promise<PublicKeySetResponse> {
    return this.http.get<PublicKeySetResponse>(API_ENDPOINTS.LICENSES.PUBLIC_KEY);
  }
}
