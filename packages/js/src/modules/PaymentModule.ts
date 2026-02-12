import type { HttpClient } from '../http/HttpClient';
import type {
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  CheckTrialEligibilityRequest,
  CreatePaymentRequest,
  CreatePaymentResponse,
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  CreatePortalSessionRequest,
  CreatePortalSessionResponse,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  SubscriptionLicenseResponse,
  SubscriptionDetailsResponse,
  TrialEligibilityResponse,
  TrialStatsResponse,
  WebhookResponse,
} from '@unilic/core';

import { LicenseError, NetworkError } from '../errors';

/**
 * Payment/Stripe operations
 * Payment endpoints (e.g. subscriptions, portal sessions).
 */
export class PaymentModule {
  constructor(private http: HttpClient) {}

  private buildIdempotencyConfig(options?: { idempotencyKey?: string }) {
    if (!options?.idempotencyKey) return undefined;
    return {
      headers: {
        'Idempotency-Key': options.idempotencyKey,
      },
    };
  }

  /** POST /api/payment/create-subscription */
  async createSubscription(
    request: CreateSubscriptionRequest,
    options?: { idempotencyKey?: string }
  ): Promise<CreateSubscriptionResponse> {
    return this.http.post<CreateSubscriptionResponse>(
      '/payment/create-subscription',
      request,
      this.buildIdempotencyConfig(options)
    );
  }

  /** POST /api/payment/create-payment-intent */
  async createPaymentIntent(
    request: CreatePaymentIntentRequest,
    options?: { idempotencyKey?: string }
  ): Promise<CreatePaymentIntentResponse> {
    return this.http.post<CreatePaymentIntentResponse>(
      '/payment/create-payment-intent',
      request,
      this.buildIdempotencyConfig(options)
    );
  }

  /** POST /api/payment/create-payment */
  async createPayment(
    request: CreatePaymentRequest,
    options?: { idempotencyKey?: string }
  ): Promise<CreatePaymentResponse> {
    return this.http.post<CreatePaymentResponse>(
      '/payment/create-payment',
      request,
      this.buildIdempotencyConfig(options)
    );
  }

  /** POST /api/payment/check-trial-eligibility */
  async checkTrialEligibility(
    request: CheckTrialEligibilityRequest
  ): Promise<TrialEligibilityResponse> {
    return this.http.post<TrialEligibilityResponse>('/payment/check-trial-eligibility', request);
  }

  /** POST /api/payment/cancel-subscription */
  async cancelSubscription(
    request: CancelSubscriptionRequest
  ): Promise<CancelSubscriptionResponse> {
    return this.http.post<CancelSubscriptionResponse>('/payment/cancel-subscription', request);
  }

  /** POST /api/payment/create-portal-session */
  async createPortalSession(
    request: CreatePortalSessionRequest
  ): Promise<CreatePortalSessionResponse> {
    return this.http.post<CreatePortalSessionResponse>('/payment/create-portal-session', request);
  }

  /** GET /api/payment/trial-stats (admin) */
  async getTrialStats(): Promise<TrialStatsResponse> {
    return this.http.get<TrialStatsResponse>('/payment/trial-stats');
  }

  /** GET /api/payment/subscription/:subscriptionId */
  async getSubscriptionDetails(subscriptionId: string): Promise<SubscriptionDetailsResponse> {
    return this.http.get<SubscriptionDetailsResponse>(
      `/payment/subscription/${encodeURIComponent(subscriptionId)}`
    );
  }

  /** GET /api/payment/subscription-license/:subscriptionId */
  async getSubscriptionLicense(subscriptionId: string): Promise<SubscriptionLicenseResponse> {
    return this.http.get<SubscriptionLicenseResponse>(
      `/payment/subscription-license/${encodeURIComponent(subscriptionId)}`
    );
  }

  /**
   * Poll until a subscription license is available.
   * Useful after client-side confirmation, where the backend may issue the license asynchronously.
   */
  async waitForSubscriptionLicense(
    subscriptionId: string,
    options?: { timeoutMs?: number; intervalMs?: number; signal?: AbortSignal }
  ): Promise<SubscriptionLicenseResponse> {
    const timeoutMs = options?.timeoutMs ?? 60_000;
    const intervalMs = options?.intervalMs ?? 2_000;
    const startedAt = Date.now();

    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const id = setTimeout(() => resolve(), ms);
        if (options?.signal) {
          const onAbort = () => {
            clearTimeout(id);
            reject(new Error('Aborted'));
          };
          if (options.signal.aborted) return onAbort();
          options.signal.addEventListener('abort', onAbort, { once: true });
        }
      });

    while (true) {
      if (options?.signal?.aborted) {
        throw new Error('Aborted');
      }

      try {
        return await this.getSubscriptionLicense(subscriptionId);
      } catch (e) {
        const elapsed = Date.now() - startedAt;
        if (elapsed >= timeoutMs) {
          throw e;
        }

        // Backend returns 404 until the license row exists.
        // Also tolerate transient network issues while polling.
        if (e instanceof LicenseError || e instanceof NetworkError) {
          await sleep(intervalMs);
          continue;
        }

        throw e;
      }
    }
  }

  /** POST /api/payment/webhook */
  async handleWebhook(payload: any, signature: string): Promise<WebhookResponse> {
    return this.http.post<WebhookResponse>('/payment/webhook', payload, {
      headers: {
        'stripe-signature': signature,
      },
    });
  }
}
