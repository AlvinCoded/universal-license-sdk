import type { HttpClient } from '../http/HttpClient';
import type { LicenseCache } from '../cache/LicenseCache';
import type { LicenseTier, ValidateLicenseRequest, ValidateLicenseResponse } from '@unilic/core';
import type { PublicKeySetResponse } from '@unilic/core';
import { API_ENDPOINTS, sha256 } from '@unilic/core';
import { DeviceFingerprint } from '@unilic/core';
import { verifyJwtRs256 } from '../utils/jwt';

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
    const cached = this.cache
      ? await this.cache.getValidation(request.licenseKey, request.deviceId)
      : null;

    const isCachedUsable = async (value: ValidateLicenseResponse | null): Promise<boolean> => {
      if (!value?.valid) return false;

      // License expiration is a hard stop.
      const license = value.license;
      const notExpired = license?.expiresAt ? new Date(license.expiresAt) > new Date() : true;
      if (!notExpired) return false;

      // Offline lease must be present + valid for continued offline usage.
      const lease = value.offlineLease;
      if (!lease?.token || !lease.publicKey) return false;

      // Fast-path check on the lease's wall-clock expiresAt (still verify cryptographically below).
      if (lease.expiresAt && new Date(lease.expiresAt) <= new Date()) return false;

      const verified = await verifyJwtRs256<{
        exp?: number;
        typ?: string;
        licenseKey?: string;
        deviceIdHash?: string;
      }>({
        token: lease.token,
        publicKey: lease.publicKey,
      });
      if (!verified.valid) return false;

      const nowSec = Math.floor(Date.now() / 1000);
      const exp = typeof verified.payload?.exp === 'number' ? verified.payload.exp : undefined;
      if (!exp || nowSec >= exp) return false;

      if (verified.payload?.typ !== 'uls-offline-lease') return false;
      if (verified.payload?.licenseKey !== request.licenseKey) return false;

      const expectedDeviceHash = await sha256(request.deviceId);
      if (verified.payload?.deviceIdHash !== expectedDeviceHash) return false;

      return true;
    };

    // Prefer cache if it is still valid.
    if (cached && (await isCachedUsable(cached))) {
      return cached;
    }

    // Perform online validation; on network error, fall back to cached lease.
    try {
      const result = await this.http.post<ValidateLicenseResponse>(
        API_ENDPOINTS.LICENSES.VALIDATE,
        request
      );

      if (this.cache && result.valid) {
        await this.cache.cacheValidation(request.licenseKey, request.deviceId, result);
      }

      return result;
    } catch (error) {
      if (cached && (await isCachedUsable(cached))) {
        return cached;
      }
      throw error;
    }
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

    if (!(license.status === 'active' && new Date(license.expires_at) > new Date())) return false;

    // Require a still-valid offline lease for true offline enforcement.
    const deviceId = await DeviceFingerprint.generate();
    const cached = await this.cache.getValidation(licenseKey, deviceId);
    if (!cached?.valid) return false;
    const lease = cached.offlineLease;
    if (!lease?.token || !lease.publicKey) return false;

    const verified = await verifyJwtRs256<{
      exp?: number;
      typ?: string;
      licenseKey?: string;
      deviceIdHash?: string;
    }>({
      token: lease.token,
      publicKey: lease.publicKey,
    });
    if (!verified.valid) return false;

    const nowSec = Math.floor(Date.now() / 1000);
    const exp = typeof verified.payload?.exp === 'number' ? verified.payload.exp : undefined;
    if (!exp || nowSec >= exp) return false;

    if (verified.payload?.typ !== 'uls-offline-lease') return false;
    if (verified.payload?.licenseKey !== licenseKey) return false;

    const expectedDeviceHash = await sha256(deviceId);
    if (verified.payload?.deviceIdHash !== expectedDeviceHash) return false;

    return true;
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
