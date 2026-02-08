import type { HttpClient } from '../http/HttpClient';
import type { LicenseCache } from '../cache/LicenseCache';
import type {
  GetRenewalNotificationsResponse,
  License,
  Renewal,
  TestEmailRequest,
  TestEmailResponse,
  UpcomingRenewalsResponse,
  UpdateLicenseRenewalSettingsRequest,
  UpdateLicenseRenewalSettingsResponse,
} from '@universal-license/core';
import { API_ENDPOINTS } from '@universal-license/core';

/**
 * License management operations
 * License management endpoints.
 */
export class LicenseModule {
  constructor(
    private http: HttpClient,
    private cache?: LicenseCache
  ) {}

  /**
   * Get license by key (admin)
   * GET /api/licenses/:licenseKey
   *
   * @example
   * ```typescript
   * const license = await client.licenses.get('PROD-ORG-2025-XXXX-XXXX-XXXX');
   * console.log(license.status); // 'active'
   * ```
   */
  async get(licenseKey: string): Promise<License> {
    // Check cache first
    const cached = await this.cache?.get(licenseKey);
    if (cached) return cached;

    const response = await this.http.get<{ license: License }>(
      API_ENDPOINTS.LICENSES.DETAILS(licenseKey)
    );

    // Cache the result
    if (response.license) {
      await this.cache?.set(licenseKey, response.license);
    }

    return response.license;
  }

  /**
   * Get all licenses with optional filters (admin)
   * GET /api/licenses?tier=pro&status=active
   *
   * @example
   * ```typescript
   * const licenses = await client.licenses.getAll({
   *   tier: 'pro',
   *   status: 'active',
   *   productCode: 'PROD'
   * });
   * ```
   */
  async getAll(filters?: {
    tier?: string;
    status?: string;
    productId?: number;
    productCode?: string;
    organizationId?: number;
    search?: string;
  }): Promise<License[]> {
    const params: Record<string, string | number> = {};

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          params[key] = typeof value === 'number' ? value : String(value);
        }
      }
    }

    const response = await this.http.get<{ licenses: License[] }>(
      API_ENDPOINTS.LICENSES.BASE,
      Object.keys(params).length ? { params } : undefined
    );
    return response.licenses;
  }

  /**
   * Generate a new license (admin)
   * POST /api/licenses/generate
   * Generate a new license.
   *
   * @example
   * ```typescript
   * const result = await client.licenses.generate({
   *   planCode: 'PROD-PRO-ANNUAL',
   *   organizationData: {
   *     orgName: 'Example Organization',
   *     ownerName: 'Jane Doe',
   *     ownerEmail: 'owner@example.com'
   *   },
   *   durationDays: 365
   * });
   *
   * console.log('License Key:', result.license.licenseKey);
   * ```
   */
  async generate(data: {
    planCode: string;
    organizationData: {
      orgName: string;
      ownerName: string;
      ownerEmail?: string;
      phone?: string;
      address?: string;
      country?: string;
      region?: string;
      orgType?: string;
    };
    durationDays?: number;
    renewalSettings?: {
      autoRenew?: boolean;
      renewalReminderDays?: number;
    };
    forceCreate?: boolean;
  }): Promise<{
    success: boolean;
    license: License;
    organization: {
      orgCode: string;
      orgName: string;
    };
  }> {
    return this.http.post(API_ENDPOINTS.LICENSES.GENERATE, data);
  }

  /**
   * Revoke a license (admin)
   * POST /api/licenses/:licenseKey/revoke
   * Revoke a license.
   *
   * @example
   * ```typescript
   * await client.licenses.revoke('PROD-ORG-2025-XXXX-XXXX-XXXX',
   *   'Payment failure'
   * );
   * ```
   */
  async revoke(
    licenseKey: string,
    reason: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const result = await this.http.post(API_ENDPOINTS.LICENSES.REVOKE(licenseKey), { reason });

    // Clear from cache
    await this.cache?.remove(licenseKey);

    return result;
  }

  /**
   * Delete a license permanently (admin)
   * DELETE /api/licenses/:licenseKey
   * Delete a license.
   */
  async delete(licenseKey: string): Promise<void> {
    await this.http.delete(API_ENDPOINTS.LICENSES.DELETE(licenseKey));
    await this.cache?.remove(licenseKey);
  }

  /**
   * Get dashboard statistics (admin)
   * GET /api/licenses/stats/dashboard
   * Update renewal settings for a license.
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    expired: number;
    revoked: number;
    revenue: {
      total: number;
      thisMonth: number;
    };
    tierDistribution: Record<string, number>;
  }> {
    return this.http.get(API_ENDPOINTS.LICENSES.STATS);
  }

  /**
   * Get upcoming renewals (admin)
   * GET /api/licenses/renewals/upcoming?days=90
   */
  async getUpcomingRenewals(daysAhead: number = 90): Promise<License[]> {
    const response = await this.http.get<{ renewals: License[] }>(
      API_ENDPOINTS.LICENSES.UPCOMING_RENEWALS,
      { params: { days: daysAhead } }
    );
    return response.renewals;
  }

  /**
   * Get upcoming renewals with metadata (admin)
   * GET /api/licenses/renewals/upcoming?days=90
   */
  async getUpcomingRenewalsSummary(daysAhead: number = 90): Promise<UpcomingRenewalsResponse> {
    return this.http.get<UpcomingRenewalsResponse>(API_ENDPOINTS.LICENSES.UPCOMING_RENEWALS, {
      params: { days: daysAhead },
    });
  }

  /**
   * Update renewal settings for a license (admin)
   * PATCH /api/licenses/:licenseKey/renewal-settings
   */
  async updateRenewalSettings(
    licenseKey: string,
    request: UpdateLicenseRenewalSettingsRequest
  ): Promise<UpdateLicenseRenewalSettingsResponse> {
    const result = await this.http.patch<UpdateLicenseRenewalSettingsResponse>(
      API_ENDPOINTS.LICENSES.RENEWAL_SETTINGS(licenseKey),
      request
    );

    // Keep cache coherent
    await this.cache?.remove(licenseKey);
    return result;
  }

  /**
   * Get renewal notifications for a license (admin)
   * GET /api/licenses/:licenseKey/renewal-notifications
   */
  async getRenewalNotifications(licenseKey: string): Promise<GetRenewalNotificationsResponse> {
    return this.http.get<GetRenewalNotificationsResponse>(
      API_ENDPOINTS.LICENSES.RENEWAL_NOTIFICATIONS(licenseKey)
    );
  }

  /**
   * Test email functionality (admin)
   * POST /api/licenses/test-email
   */
  async testEmail(request: TestEmailRequest): Promise<TestEmailResponse> {
    return this.http.post<TestEmailResponse>(API_ENDPOINTS.LICENSES.TEST_EMAIL, request);
  }

  /**
   * Get renewal history for a license (admin)
   * GET /api/licenses/:licenseKey/renewals
   */
  async getRenewalsHistory(licenseKey: string): Promise<Renewal[]> {
    const response = await this.http.get<{ renewals: Renewal[] }>(
      API_ENDPOINTS.LICENSES.RENEWALS_HISTORY(licenseKey)
    );
    return response.renewals;
  }

  /**
   * Check if license has specific feature
   */
  async hasFeature(licenseKey: string, feature: string): Promise<boolean> {
    const license = await this.get(licenseKey);
    return license.features?.[feature] === true;
  }

  /**
   * Read the cached license object (if available) without calling the API
   * Returns the raw license object as stored by the cache (snake_case shape)
   */
  async getCached(licenseKey: string): Promise<License | null> {
    if (!this.cache) return null;
    const cached = await this.cache.get(licenseKey);
    return cached ? cached : null;
  }

  /**
   * Check if license tier meets requirement
   * Uses tier hierarchy: standard < pro < enterprise
   */
  async hasTier(licenseKey: string, requiredTier: string): Promise<boolean> {
    const tierHierarchy: Record<string, number> = {
      standard: 1,
      pro: 2,
      enterprise: 3,
    };

    const license = await this.get(licenseKey);
    const currentLevel = tierHierarchy[license.tier] || 0;
    const requiredLevel = tierHierarchy[requiredTier] || 0;

    return currentLevel >= requiredLevel;
  }

  /**
   * Get days until license expiry
   */
  async getDaysUntilExpiry(licenseKey: string): Promise<number> {
    // Check cache first
    const days = await this.cache?.getDaysUntilExpiry(licenseKey);
    if (days !== null && days !== undefined) return days;

    const license = await this.get(licenseKey);
    const expiryDate = new Date(license.expires_at);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  /**
   * Check if license is currently valid (active and not expired)
   */
  async isValid(licenseKey: string): Promise<boolean> {
    try {
      const license = await this.get(licenseKey);
      const isActive = license.status === 'active';
      const notExpired = new Date(license.expires_at) > new Date();
      return isActive && notExpired;
    } catch {
      return false;
    }
  }
}
