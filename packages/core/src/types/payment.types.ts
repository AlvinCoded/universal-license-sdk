/**
 * Stripe/payment types
 * Payment-related API types.
 */

export interface CreateSubscriptionRequest {
  email: string;
  planId: number | string;
  organizationId: number | string;
  productId: number | string;
  trialDays?: number | string;
  deviceFingerprint?: string;
  paymentMethodId?: string;
}

export interface CreateSubscriptionResponse {
  success: boolean;
  subscriptionId: string;
  clientSecret: string | null;
  status: string;
  trialEnd: string | null;
  hasTrial: boolean;
}

export interface CreatePaymentIntentRequest {
  amount: number | string;
  currency: string;
  orderId: string;
  organizationId: number | string;
  planCode: string;
  email: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
}

export type PaymentGateway = 'stripe' | 'paystack';

/**
 * Gateway-neutral one-time payment creation
 * POST /api/payment/create-payment
 */
export interface CreatePaymentRequest extends CreatePaymentIntentRequest {
  gateway: PaymentGateway;
  /** Used by redirect-style gateways (e.g. Paystack). */
  callbackUrl?: string;
}

export type CreatePaymentResponse =
  | {
      success: true;
      gateway: 'stripe';
      type: 'payment_intent';
      clientSecret: string | null;
      paymentIntentId: string;
    }
  | {
      success: true;
      gateway: 'paystack';
      type: 'redirect';
      authorizationUrl: string;
      reference: string;
    };

export interface CheckTrialEligibilityRequest {
  email: string;
  productId: number | string;
  deviceFingerprint?: string;
}

export interface TrialRecord {
  id: number;
  product_id: number;
  plan_id: number;
  trial_status: 'active' | 'completed' | 'cancelled' | 'converted';
  trial_started_at: string;
  trial_ended_at?: string | null;
  trial_duration_days: number;
  organization_id?: number | null;
  device_fingerprint?: string | null;
  ip_address?: string | null;
  created_at: string;
  metadata?: Record<string, any> | null;
}

export interface TrialEligibilityResponse {
  eligible: boolean;
  reason?: string;
  previousTrial?: TrialRecord;
}

export interface CancelSubscriptionRequest {
  subscriptionId: string;
  cancelImmediately?: boolean;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  subscription: {
    id: string;
    status: string;
    cancelAt: string | null;
    canceledAt: string | null;
  };
}

export interface CreatePortalSessionRequest {
  customerId: string;
  returnUrl: string;
}

export interface CreatePortalSessionResponse {
  success: boolean;
  url: string;
}

export interface TrialStatsResponse {
  active: number;
  completed: number;
  cancelled: number;
  converted: number;
  conversionRate: number;
}

export interface SubscriptionDetailsResponse {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
}

/**
 * Stripe webhook response
 * POST /api/payment/webhook
 */
export interface WebhookResponse {
  received: boolean;
}
