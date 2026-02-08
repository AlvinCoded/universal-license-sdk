import type { LicenseTier, SDKConfig } from '@universal-license/core';
import { DEFAULT_CONFIG } from '@universal-license/core';

import { HttpClient } from './http/HttpClient';
import { LicenseModule } from './modules/LicenseModule';
import { PurchaseModule } from './modules/PurchaseModule';
import { ProductModule } from './modules/ProductModule';
import { PlanModule } from './modules/PlanModule';
import { RenewalModule } from './modules/RenewalModule';
import { ValidationModule } from './modules/ValidationModule';
import { OwnershipModule } from './modules/OwnershipModule';
import { AuthModule } from './modules/AuthModule';
import { OrganizationModule } from './modules/OrganizationModule';
import { ActivityModule } from './modules/ActivityModule';
import { PaymentModule } from './modules/PaymentModule';
import { ImportModule } from './modules/ImportModule';
import { ExportModule } from './modules/ExportModule';
import { HealthModule } from './modules/HealthModule';
import { LicenseCache } from './cache/LicenseCache';
import { LocalStorage, SessionStorage, MemoryStorage } from './storage';
import type { StorageAdapter } from './storage';

/**
 * Universal License Client
 * Main SDK class that provides access to all license server features
 *
 * High-level SDK client that composes feature modules.
 * and provides a similar developer experience to your admin portal hooks (frontend/src/hooks/useLicenses.ts)
 *
 * @example Basic Usage
 * ```typescript
 * import { LicenseClient } from '@universal-license/client';
 *
 * const client = new LicenseClient({
 *   baseUrl: 'https://license.yourcompany.com/api',
 *   cache: true
 * });
 *
 * // Validate a license
 * const result = await client.validate({
 *   licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
 *   deviceId: await DeviceFingerprint.generate()
 * });
 *
 * if (result.valid) {
 *   console.log('License is valid!');
 *   enableFeatures(result.license.features);
 * }
 * ```
 *
 * @example Purchase Flow (Landing Page)
 * ```typescript
 * // Step 1: Get available plans
 * const plans = await client.products.getPlans('PROD');
 *
 * // Step 2: Create purchase order
 * const order = await client.purchases.createOrder({
 *   planCode: 'PROD-PRO-ANNUAL',
 *   organizationData: {
 *     orgName: 'Example Organization',
 *     ownerName: 'Jane Doe',
 *     ownerEmail: 'owner@example.com'
 *   }
 * });
 *
 * // Step 3: Complete after payment
 * const purchase = await client.purchases.completePurchase({
 *   orderId: order.orderId,
 *   paymentReference: 'pi_stripe_123'
 * });
 *
 * console.log('License Key:', purchase.license.licenseKey);
 * ```
 *
 * @example With Admin Authentication
 * ```typescript
 * const client = new LicenseClient({
 *   baseUrl: 'https://license.yourcompany.com/api',
 *   apiKey: 'your-jwt-token', // From login
 *   debug: true
 * });
 *
 * // Admin operations (requires authentication)
 * const stats = await client.licenses.getStats();
 * const allLicenses = await client.licenses.getAll({ tier: 'pro' });
 * ```
 */
export class LicenseClient {
  private http: HttpClient;
  private cache?: LicenseCache;
  private config: SDKConfig;

  // Public module interfaces - these are what developers interact with
  public readonly licenses: LicenseModule;
  public readonly purchases: PurchaseModule;
  public readonly products: ProductModule;
  public readonly plans: PlanModule;
  public readonly renewals: RenewalModule;
  public readonly validation: ValidationModule;
  public readonly ownership: OwnershipModule;

  // Admin & platform modules
  public readonly auth: AuthModule;
  public readonly organizations: OrganizationModule;
  public readonly activity: ActivityModule;
  public readonly payments: PaymentModule;
  public readonly imports: ImportModule;
  public readonly exports: ExportModule;
  public readonly health: HealthModule;

  /**
   * Initialize the License Client
   *
   * @param config - SDK configuration
   * @param config.baseUrl - Base URL of your license server API (required)
   * @param config.apiKey - JWT token for authenticated requests (optional, required for admin operations)
   * @param config.timeout - Request timeout in milliseconds (default: 30000)
   * @param config.retries - Number of retry attempts for failed requests (default: 3)
   * @param config.cache - Enable response caching (default: true)
   * @param config.debug - Enable debug logging (default: false)
   */
  constructor(config: SDKConfig) {
    // Validate required config
    if (!config.baseUrl) {
      throw new Error('baseUrl is required in SDK configuration');
    }

    // Merge with defaults
    this.config = {
      timeout: DEFAULT_CONFIG.TIMEOUT,
      retries: DEFAULT_CONFIG.RETRIES,
      cache: DEFAULT_CONFIG.CACHE_ENABLED,
      debug: false,
      ...config,
    };

    // Initialize HTTP client (handles all network communication)
    this.http = new HttpClient(this.config);

    // Initialize cache if enabled
    if (this.config.cache !== false) {
      const storage = this.createStorageAdapter();
      this.cache = new LicenseCache(storage, this.config.cacheTTL ?? DEFAULT_CONFIG.CACHE_TTL);
    }

    // Initialize all feature modules
    // Each module corresponds to a backend controller and provides typed methods
    this.licenses = new LicenseModule(this.http, this.cache);
    this.purchases = new PurchaseModule(this.http);
    this.products = new ProductModule(this.http, this.cache);
    this.plans = new PlanModule(this.http);
    this.renewals = new RenewalModule(this.http);
    this.validation = new ValidationModule(this.http, this.cache);
    this.ownership = new OwnershipModule(this.http);

    this.auth = new AuthModule(this.http);
    this.organizations = new OrganizationModule(this.http);
    this.activity = new ActivityModule(this.http);
    this.payments = new PaymentModule(this.http);
    this.imports = new ImportModule(this.http);
    this.exports = new ExportModule(this.http);
    this.health = new HealthModule(this.http);
  }

  /**
   * Update the JWT token used for authenticated requests.
   * Useful if you store the token externally and want to swap users.
   */
  setApiKey(apiKey?: string): void {
    this.http.setApiKey(apiKey);
  }

  /**
   * Create appropriate storage adapter based on environment
   */
  private createStorageAdapter(): StorageAdapter {
    // Browser environment - use localStorage for persistence
    if (typeof window !== 'undefined' && window.localStorage) {
      return new LocalStorage('uls_');
    }

    // Node.js environment - use in-memory storage
    return new MemoryStorage('uls_');
  }

  /**
   * Quick validation helper
   * Validates a license key with device binding
   *
   * This is the most common operation - used during app startup/onboarding
   * Validate a license key (optionally including device info and constraints).
   *
   * @example
   * ```typescript
   * import { LicenseClient, DeviceFingerprint } from '@universal-license/client';
   *
   * const client = new LicenseClient({
   *   baseUrl: 'https://license.yourcompany.com/api'
   * });
   *
   * const result = await client.validate({
   *   licenseKey: userEnteredKey,
   *   deviceId: await DeviceFingerprint.generate(),
   *   requiredTier: 'pro',
   *   requiredFeatures: ['advancedReporting']
   * });
   *
   * if (result.valid) {
   *   // Store license info
   *   localStorage.setItem('licenseKey', licenseKey);
   *   localStorage.setItem('licenseTier', result.license.tier);
   *   localStorage.setItem('licenseFeatures', JSON.stringify(result.license.features));
   *
   *   // Enable application features
   *   enableFeatures(result.license.features);
   * } else {
   *   showError(result.error);
   * }
   * ```
   */
  async validate(request: {
    licenseKey: string;
    deviceId: string;
    requiredTier?: LicenseTier;
    requiredFeatures?: string[];
  }) {
    return this.validation.validate(request);
  }

  /**
   * Quick license validity check (boolean)
   * Uses cached data when available for instant response
   *
   * @example
   * ```typescript
   * const isValid = await client.isLicenseValid('PROD-ORG-2025-XXXX-XXXX-XXXX');
   * if (!isValid) {
   *   redirectToRenewalPage();
   * }
   * ```
   */
  async isLicenseValid(licenseKey: string): Promise<boolean> {
    // Check cache first for instant response
    const cached = await this.cache?.get(licenseKey);
    if (cached) {
      return cached.status === 'active' && new Date(cached.expires_at) > new Date();
    }

    // Fallback to API validation
    try {
      const result = await this.validation.validateSimple(licenseKey);
      return result.valid;
    } catch {
      return false;
    }
  }

  /**
   * Convenience: get cached license object (if available)
   * This returns the raw cached license (snake_case fields) or null
   */
  async getCachedLicense(licenseKey: string) {
    return this.licenses.getCached(licenseKey);
  }

  /**
   * Check if license has specific feature
   * Useful for feature gating in your application
   *
   * Matches the pattern used in your frontend (frontend/src/lib/utils.ts)
   *
   * @example
   * ```typescript
   * // In your application
   * const hasAdvancedReports = await client.hasFeature(
   *   licenseKey,
   *   'advancedReporting'
   * );
   *
   * if (hasAdvancedReports) {
   *   showAdvancedReportsMenu();
   * } else {
   *   showUpgradePrompt();
   * }
   * ```
   */
  async hasFeature(licenseKey: string, feature: string): Promise<boolean> {
    return this.licenses.hasFeature(licenseKey, feature);
  }

  /**
   * Check if license tier meets minimum requirement
   * Uses tier hierarchy: standard < pro < enterprise
   *
   * @example
   * ```typescript
   * const canAccessProFeatures = await client.hasTier(licenseKey, 'pro');
   * if (!canAccessProFeatures) {
   *   showUpgradePrompt('pro');
   * }
   * ```
   */
  async hasTier(licenseKey: string, requiredTier: string): Promise<boolean> {
    return this.licenses.hasTier(licenseKey, requiredTier);
  }

  /**
   * Get days until license expiration
   * Useful for showing expiry warnings
   *
   * @example
   * ```typescript
   * const daysLeft = await client.getDaysUntilExpiry(licenseKey);
   *
   * if (daysLeft < 30) {
   *   showRenewalReminder(`Your license expires in ${daysLeft} days`);
   * }
   * ```
   */
  async getDaysUntilExpiry(licenseKey: string): Promise<number> {
    return this.licenses.getDaysUntilExpiry(licenseKey);
  }

  /**
   * Update SDK configuration at runtime
   * Useful for setting auth token after login
   *
   * @example
   * ```typescript
   * // After user logs in to admin portal
   * const loginResponse = await fetch('/api/auth/login', {
   *   method: 'POST',
   *   body: JSON.stringify({ username, password })
   * });
   *
   * const { token } = await loginResponse.json();
   *
   * // Update SDK to use auth token
   * client.setConfig({ apiKey: token });
   *
   * // Now can access admin endpoints
   * const stats = await client.licenses.getStats();
   * ```
   */
  setConfig(config: Partial<SDKConfig>): void {
    this.config = { ...this.config, ...config };
    this.http.updateConfig(config);
  }

  /**
   * Get current SDK configuration
   */
  getConfig(): SDKConfig {
    return { ...this.config };
  }

  /**
   * Set authentication token (convenience method)
   * Same as setConfig({ apiKey: token })
   *
   * @example
   * ```typescript
   * client.setToken('eyJhbGciOiJIUzI1NiIs...');
   * ```
   */
  setToken(token: string | null): void {
    this.setConfig({ apiKey: token || undefined });
  }

  /**
   * Clear all caches
   * Useful after logout or when forcing fresh data
   *
   * @example
   * ```typescript
   * // After user logs out
   * client.clearCache();
   * client.setToken(null);
   * ```
   */
  clearCache(): void {
    this.cache?.clear();
  }

  /**
   * Test connection to license server
   * Calls the GET /api/health endpoint
   *
   * Useful for:
   * - Checking server availability
   * - Measuring latency
   * - Verifying configuration
   *
   * @example
   * ```typescript
   * const health = await client.testConnection();
   *
   * if (!health.healthy) {
   *   showError('License server unavailable');
   * }
   *
   * console.log('Latency:', health.latency, 'ms');
   * ```
   */
  async testConnection(): Promise<{
    healthy: boolean;
    latency: number;
    version?: string;
  }> {
    return this.http.testConnection();
  }

  /**
   * Create storage adapter with custom prefix
   * Advanced usage for multiple instances
   */
  static createStorage(
    type: 'local' | 'session' | 'memory',
    prefix: string = 'uls_'
  ): StorageAdapter {
    switch (type) {
      case 'local':
        return new LocalStorage(prefix);
      case 'session':
        return new SessionStorage(prefix);
      case 'memory':
        return new MemoryStorage(prefix);
      default:
        throw new Error(`Unknown storage type: ${type}`);
    }
  }
}

// Default export for convenience
export default LicenseClient;
