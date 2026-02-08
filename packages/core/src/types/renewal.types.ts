/**
 * Renewal and notification types
 * Matches your backend renewal-related types
 */

/**
 * Renewal Status
 */
export type RenewalStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

/**
 * Renewal Type
 */
export type RenewalType = 'auto' | 'manual';

/**
 * Renewal Entity
 * Matches your backend renewals table
 */
export interface Renewal {
  id: number;
  renewal_id: string;
  license_id: number;
  license_key: string;
  renewal_type: RenewalType;
  status: RenewalStatus;
  previous_expires_at: string;
  new_expires_at: string;
  amount?: number;
  currency?: string;
  payment_reference?: string;
  initiated_at: string;
  completed_at?: string;
  metadata?: Record<string, any>;

  // Joined fields
  org_name?: string;
  product_name?: string;
  plan_name?: string;
  tier?: string;
  price_amount?: number;
  price_currency?: string;
  duration_days?: number;
  auto_renew?: boolean;
}

/**
 * Renewal Request
 */
export interface RenewalRequest {
  licenseKey: string;
  durationDays?: number;
  paymentReference?: string;
}

/**
 * Magic Link Request
 * For self-service license renewal
 */
export interface MagicLinkRequest {
  licenseKey: string;
  email: string;
}

/**
 * Magic link request response
 * POST /api/renewal/request-magic-link
 */
export interface MagicLinkResponse {
  success: boolean;
  message: string;
  expiresIn: string;
}

/**
 * Verify renewal token response
 * GET /api/renewal/verify-token/:token
 */
export interface RenewalVerifyResponse {
  valid: boolean;
  license: {
    licenseKey: string;
    orgName: string;
    productName: string;
    tier: string;
    expiresAt: string;
    status: string;
    priceAmount?: number;
    priceCurrency?: string;
    durationDays?: number;
  };
  tokenExpiresAt: string;
}

/**
 * Renewal process request
 * POST /api/renewal/process
 */
export interface RenewalProcessRequest {
  token: string;
  durationDays?: number;
  paymentReference?: string;
}

/**
 * Renewal process response
 * POST /api/renewal/process
 * POST /api/licenses/:licenseKey/renew
 */
export interface RenewalProcessResponse {
  success: boolean;
  message: string;
  license: {
    licenseKey: string;
    expiresAt: string;
    renewalId: string;
  };
}

/**
 * Renewal Notification
 */
export interface RenewalNotification {
  id: number;
  license_key: string;
  notification_type: 'email' | 'webhook';
  days_before_expiry: number;
  sent_at: string;
  recipient: string;
  status: 'sent' | 'failed';
  error_message?: string;
}
