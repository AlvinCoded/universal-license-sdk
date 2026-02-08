/**
 * License-related types
 * These mirror your backend License and frontend license types
 */

/**
 * License Tiers
 * Matches your backend/frontend tier hierarchy
 */
export type LicenseTier = 'standard' | 'pro' | 'enterprise';

/**
 * License Status
 * Matches your backend license statuses
 */
export type LicenseStatus = 'pending' | 'active' | 'expired' | 'revoked' | 'suspended';

/**
 * License Entity
 * Matches the License type from your backend/frontend
 */
export interface License {
  id: number;
  license_key: string;
  organization_id: number;
  plan_id: number;
  tier: LicenseTier;
  status: LicenseStatus;

  // Features and restrictions
  features: Record<string, boolean>;
  max_users?: number;

  // Dates
  issued_at: string;
  activated_at?: string;
  expires_at: string;
  last_validated_at?: string;

  // Renewal settings
  renewal_enabled: boolean;
  auto_renew: boolean;
  notification_days?: string;
  last_notification_sent_at?: string;

  // Metadata
  created_at: string;
  updated_at: string;

  // Joined fields (from your database queries)
  org_name?: string;
  org_code?: string;
  owner_name?: string;
  owner_email?: string;
  product_code?: string;
  product_name?: string;
  plan_code?: string;
  plan_name?: string;
  duration_days?: number;
  price_amount?: number;
  price_currency?: string;
}

/**
 * Validate License Request
 * Used when validating a license key
 * Matches your backend ValidateLicenseRequest
 */
export interface ValidateLicenseRequest {
  licenseKey: string;
  deviceId: string;
  requiredTier?: LicenseTier;
  requiredFeatures?: string[];
}

/**
 * Validate License Response
 * Returned from license validation endpoint
 * Matches your backend ValidateLicenseResponse
 */
export interface ValidateLicenseResponse {
  valid: boolean;

  license?: {
    licenseKey: string;
    tier: LicenseTier;
    features: Record<string, boolean>;
    maxUsers?: number;
    orgName: string;
    productCode: string;
    expiresAt: string;
    daysUntilExpiry?: number;
  };

  signature?: string;
  /**
   * Key ID of the server signing key used to produce `signature`.
   * Present when the server supports signing key rotation.
   */
  signatureKid?: string;

  /**
   * Whether this license has been claimed by an app-side owner (super admin).
   * Provided by /api/licenses/validate for onboarding UX.
   */
  ownerClaimed?: boolean;

  organization?: {
    name: string;
    type?: string;
  };

  error?: string;
  reason?: string;
  currentTier?: LicenseTier;
  requiredTier?: LicenseTier;
  missingFeatures?: string[];
}

// ============================================================================
// OWNERSHIP & INVITES (App-side onboarding)
// ============================================================================

export interface LicenseOwnershipStatusResponse {
  ownerClaimed: boolean;
  claimedAt?: string;
  ownerPublicKey?: string;
}

export interface ClaimLicenseOwnerRequest {
  deviceId: string;
  ownerPublicKey?: string;
}

export interface ClaimLicenseOwnerResponse {
  ownerClaimed: true;
  claimedAt: string;
  ownerToken: string;
  tokenExpiresIn: string;
}

export interface CreateLicenseInviteRequest {
  expiresInMinutes?: number;
  maxUses?: number;
}

export interface CreateLicenseInviteResponse {
  inviteCode: string;
  expiresAt: string;
  maxUses: number;
}

export interface RedeemLicenseInviteRequest {
  inviteCode: string;
  deviceId: string;
}

export interface RedeemLicenseInviteResponse {
  success: boolean;
  grantToken: string;
  tokenExpiresIn: string;
  expiresAt: string;
}

/**
 * License Generation Request
 * Used for generating new licenses (admin only)
 * Matches your backend GenerateLicenseRequest
 */
export interface GenerateLicenseRequest {
  planCode: string;
  organizationData: {
    orgName: string;
    orgType?: string;
    ownerName: string;
    ownerEmail?: string;
    address?: string;
    phone?: string;
    email?: string;
    country?: string;
    region?: string;
  };
  durationDays?: number;
  renewalEnabled?: boolean;
  autoRenew?: boolean;
  notificationDays?: string;
}

/**
 * License Renewal Request
 * Used when renewing an existing license
 * Matches your backend RenewLicenseRequest
 */
export interface RenewLicenseRequest {
  licenseKey: string;
  durationDays?: number;
  paymentReference?: string;
}

/**
 * License Renewal Response
 */
export interface RenewLicenseResponse {
  success: boolean;
  message: string;
  license: {
    licenseKey: string;
    expiresAt: string;
    renewalId: string;
  };
}

/**
 * License Revocation Request
 */
export interface RevokeLicenseRequest {
  licenseKey: string;
  reason: string;
}

/**
 * License Filters
 * Used when fetching license lists
 * Matches your backend LicenseFilters
 */
export interface LicenseFilters {
  status?: LicenseStatus;
  tier?: LicenseTier;
  productCode?: string;
  organizationId?: number;
  search?: string;
}

/**
 * Upcoming renewals response
 * GET /api/licenses/renewals/upcoming
 */
export interface UpcomingRenewalsResponse {
  renewals: License[];
  count: number;
  daysAhead: number;
}

/**
 * PATCH /api/licenses/:licenseKey/renewal-settings
 */
export interface UpdateLicenseRenewalSettingsRequest {
  renewalEnabled?: boolean;
  autoRenew?: boolean;
}

export interface UpdateLicenseRenewalSettingsResponse {
  success: boolean;
  license: License;
}

/**
 * GET /api/licenses/:licenseKey/renewal-notifications
 */
export interface GetRenewalNotificationsResponse {
  notifications: import('./renewal.types').RenewalNotification[];
}

/**
 * POST /api/licenses/test-email
 */
export interface TestEmailRequest {
  email: string;
}

export interface TestEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  configured: boolean;
}

/**
 * License Statistics
 */
export interface LicenseStats {
  total: number;
  active: number;
  pending: number;
  expired: number;
  revoked: number;
  byTier: {
    standard: number;
    pro: number;
    enterprise: number;
  };
  expiringWithin30Days: number;
}

/**
 * Validation Log Entry
 * Matches your backend validation_logs table structure
 */
export interface ValidationLog {
  id: number;
  license_key: string;
  device_id_hash: string;
  validation_type: string;
  success: boolean;
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

/**
 * Public key response for signature verification.
 * Backwards compatible with legacy `{ publicKey }` responses.
 */
export interface PublicKeySetResponse {
  /** Active signing key ID */
  kid?: string;
  /** Active public key (legacy field) */
  publicKey: string;
  /** Keyset for rotation-aware clients */
  keys?: Array<{
    kid: string;
    publicKey: string;
    status?: 'active' | 'retired' | string;
    createdAt?: string;
  }>;
}
