import type { HttpClient } from '../http/HttpClient';
import type {
  MagicLinkRequest,
  MagicLinkResponse,
  RenewalProcessRequest,
  RenewalProcessResponse,
  RenewalRequest,
  RenewalVerifyResponse,
} from '@universal-license/core';
import { API_ENDPOINTS } from '@universal-license/core';

/**
 * License renewal operations
 * Renewal endpoints.
 */
export class RenewalModule {
  constructor(private http: HttpClient) {}

  /**
   * Renew a license
   * POST /api/licenses/:licenseKey/renew
   * Renew an existing license.
   *
   * @example
   * ```typescript
   * // After payment success
   * const result = await client.renewals.renew({
   *   licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
   *   durationDays: 365,
   *   paymentReference: 'pi_stripe_payment_intent'
   * });
   *
   * console.log('New expiry:', result.newExpiry);
   * ```
   */
  async renew(request: RenewalRequest): Promise<RenewalProcessResponse> {
    return this.http.post<RenewalProcessResponse>(
      API_ENDPOINTS.LICENSES.RENEW(request.licenseKey),
      {
        durationDays: request.durationDays,
        paymentReference: request.paymentReference,
      }
    );
  }

  /**
   * Request magic link for license renewal
   * POST /api/renewal/request-magic-link
   * Request a renewal magic link.
   *
   * @example
   * ```typescript
   * // Send renewal link to customer
   * await client.renewals.requestMagicLink({
   *   licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
   *   email: 'customer@example.com'
   * });
   *
   * // Customer receives email with renewal link
   * ```
   */
  async requestMagicLink(request: MagicLinkRequest): Promise<MagicLinkResponse> {
    return this.http.post(API_ENDPOINTS.RENEWAL.REQUEST_LINK, request);
  }

  /**
   * Verify a renewal token and get license details
   * GET /api/renewal/verify-token/:token
   */
  async verifyToken(token: string): Promise<RenewalVerifyResponse> {
    return this.http.get<RenewalVerifyResponse>(API_ENDPOINTS.RENEWAL.VERIFY_TOKEN(token));
  }

  /**
   * Process renewal via magic link token
   * POST /api/renewal/process
   * Called when customer clicks renewal link in email
   */
  async processRenewalWithToken(data: RenewalProcessRequest): Promise<RenewalProcessResponse> {
    return this.http.post<RenewalProcessResponse>(API_ENDPOINTS.RENEWAL.PROCESS, data);
  }
}
