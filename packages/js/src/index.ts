/**
 * @universal-license/client
 * Universal License Server - JavaScript/TypeScript Client SDK
 *
 * A comprehensive SDK for integrating with the Universal License Server.
 * Supports license validation, purchase flows, product management, and renewals.
 *
 * @packageDocumentation
 *
 * @example Quick Start
 * ```typescript
 * import { LicenseClient, DeviceFingerprint } from '@universal-license/client';
 *
 * const client = new LicenseClient({
 *   baseUrl: 'https://license.yourcompany.com/api'
 * });
 *
 * // Validate license
 * const result = await client.validate({
 *   licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
 *   deviceId: await DeviceFingerprint.generate()
 * });
 *
 * if (result.valid) {
 *   console.log('Valid license!');
 * }
 * ```
 *
 * @example Purchase Flow
 * ```typescript
 * // Get plans
 * const plans = await client.products.getPlans('PRODUCT-CODE');
 *
 * // Create order
 * const order = await client.purchases.createOrder({
 *   planCode: 'PRO-ANNUAL',
 *   organizationData: {
 *     orgName: 'Acme Corp',
 *     ownerName: 'John Doe',
 *     ownerEmail: 'john@acme.com'
 *   }
 * });
 *
 * // After payment
 * const purchase = await client.purchases.completePurchase({
 *   orderId: order.orderId,
 *   paymentReference: 'payment_ref'
 * });
 * ```
 *
 * @example Admin Operations
 * ```typescript
 * const client = new LicenseClient({
 *   baseUrl: 'https://license.yourcompany.com/api',
 *   apiKey: 'your-jwt-token' // From login
 * });
 *
 * // Get statistics
 * const stats = await client.licenses.getStats();
 *
 * // Generate license
 * const result = await client.licenses.generate({
 *   planCode: 'PRO-ANNUAL',
 *   organizationData: { ... }
 * });
 * ```
 */

// ============================================================================
// MAIN CLIENT
// ============================================================================

import { LicenseClient } from './LicenseClient';

export { LicenseClient };
export default LicenseClient;

// ============================================================================
// MODULES
// ============================================================================

export { LicenseModule } from './modules/LicenseModule';
export { PurchaseModule } from './modules/PurchaseModule';
export { ProductModule } from './modules/ProductModule';
export { PlanModule } from './modules/PlanModule';
export { RenewalModule } from './modules/RenewalModule';
export { ValidationModule } from './modules/ValidationModule';
export { OwnershipModule } from './modules/OwnershipModule';
export { AuthModule } from './modules/AuthModule';
export { OrganizationModule } from './modules/OrganizationModule';
export { ActivityModule } from './modules/ActivityModule';
export { PaymentModule } from './modules/PaymentModule';
export { ImportModule } from './modules/ImportModule';
export { ExportModule } from './modules/ExportModule';
export { HealthModule } from './modules/HealthModule';

// ============================================================================
// HTTP & NETWORKING
// ============================================================================

export { HttpClient } from './http/HttpClient';
export { RetryStrategy, exponentialBackoff } from './http/retry';
export type { RetryConfig } from './http/retry';

// ============================================================================
// STORAGE & CACHING
// ============================================================================

export { LicenseCache } from './cache/LicenseCache';
export { LocalStorage, SessionStorage, MemoryStorage } from './storage';
export type { StorageAdapter } from './storage';

// ============================================================================
// ERROR HANDLING
// ============================================================================

export { LicenseError, ValidationError, NetworkError, PurchaseError } from './errors';

// ============================================================================
// RE-EXPORT CORE TYPES (for convenience)
// ============================================================================

export type {
  // Configuration
  SDKConfig,
  ApiResponse,
  ErrorResponse,
  PaginatedResponse,

  // Auth
  AuthUser,
  LoginRequest,
  LoginResponse,
  VerifyResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,

  // License types
  License,
  LicenseTier,
  LicenseStatus,
  ValidateLicenseRequest,
  ValidateLicenseResponse,
  LicenseOwnershipStatusResponse,
  ClaimLicenseOwnerRequest,
  ClaimLicenseOwnerResponse,
  CreateLicenseInviteRequest,
  CreateLicenseInviteResponse,
  RedeemLicenseInviteRequest,
  RedeemLicenseInviteResponse,

  // Purchase types
  CreateOrderRequest,
  CreateOrderResponse,
  PurchaseOrder,
  CompletePurchaseRequest,
  CompletePurchaseResponse,
  PaymentStatus,

  // Product types
  Product,
  SubscriptionPlan,
  UpdateProductRequest,
  UpdatePlanRequest,

  // Organizations
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationWithLicensesResponse,

  // Activity
  ActivityLog,
  GetActivityLogsResponse,
  GetValidationLogsResponse,

  // Payment
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  CheckTrialEligibilityRequest,
  TrialEligibilityResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  CreatePortalSessionRequest,
  CreatePortalSessionResponse,
  TrialStatsResponse,
  SubscriptionDetailsResponse,
  WebhookResponse,

  // Import/Export
  ExportFormat,
  ImportDataType,
  ImportMode,
  ImportValidateResponse,
  ImportPreviewResponse,
  ImportExecuteResponse,

  // Renewal
  MagicLinkRequest,
  MagicLinkResponse,
  RenewalProcessRequest,
  RenewalProcessResponse,
  RenewalVerifyResponse,
  UpcomingRenewalsResponse,

  // License renewal management
  UpdateLicenseRenewalSettingsRequest,
  UpdateLicenseRenewalSettingsResponse,
  GetRenewalNotificationsResponse,
  TestEmailRequest,
  TestEmailResponse,

  // Health
  HealthResponse,
  DatabaseHealthResponse,
  EmailStatusResponse,
} from '@universal-license/core';

// ============================================================================
// RE-EXPORT UTILITIES
// ============================================================================

export { DeviceFingerprint } from '@universal-license/core';
export {
  isValidEmail,
  isValidLicenseKey,
  isValidProductCode,
  isValidPlanCode,
  isValidTier,
  isLicenseExpired,
  daysUntilExpiry,
} from '@universal-license/core';

export {
  generateRandomString,
  sha256,
  verifySignature,
  generateUUID,
} from '@universal-license/core';

// ============================================================================
// RE-EXPORT CONSTANTS
// ============================================================================

export {
  LICENSE_TIERS,
  LICENSE_STATUS,
  PAYMENT_STATUS,
  API_ENDPOINTS,
  ERROR_CODES,
  DEFAULT_CONFIG,
  VALIDATION_PATTERNS,
  STORAGE_KEYS,
} from '@universal-license/core';

// ============================================================================
// VERSION
// ============================================================================

export const VERSION = '1.0.0';

/**
 * Create a new LicenseClient instance (convenience function)
 *
 * @example
 * ```typescript
 * import { createClient } from '@universal-license/client';
 *
 * const client = createClient({
 *   baseUrl: 'https://license.yourcompany.com/api'
 * });
 * ```
 */
export function createClient(config: import('@universal-license/core').SDKConfig) {
  return new LicenseClient(config);
}
