import type { HttpClient } from '../http/HttpClient';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  PurchaseOrder,
  CompletePurchaseRequest,
  CompletePurchaseResponse,
} from '@unilic/core';
import { API_ENDPOINTS } from '@unilic/core';

/**
 * Purchase and subscription operations
 */
export class PurchaseModule {
  constructor(private http: HttpClient) {}

  private buildIdempotencyConfig(options?: { idempotencyKey?: string }) {
    if (!options?.idempotencyKey) return undefined;
    return {
      headers: {
        'Idempotency-Key': options.idempotencyKey,
      },
    };
  }

  /**
   * Create a new purchase order
   * POST /api/purchases/create-order
   *
   * @example
   * ```typescript
   * // Step 1: Create order before payment
   * const order = await client.purchases.createOrder({
   *   planCode: 'PROD-PRO-ANNUAL',
   *   organizationData: {
   *     orgName: 'Example Organization',
   *     ownerName: 'Jane Doe',
   *     ownerEmail: 'owner@example.com',
   *     phone: '+1-555-123-4567',
   *     address: '123 Example St',
   *     country: 'USA'
   *   },
   *   paymentMethod: 'stripe'
   * });
   *
   * console.log('Order ID:', order.orderId);
   * console.log('Amount:', order.amount, order.currency);
   *
   * // Step 2: Redirect to payment gateway
   * window.location.href = `/checkout/${order.orderId}`;
   * ```
   */
  async createOrder(
    request: CreateOrderRequest,
    options?: { idempotencyKey?: string }
  ): Promise<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(
      API_ENDPOINTS.PURCHASES.CREATE_ORDER,
      request,
      this.buildIdempotencyConfig(options)
    );
  }

  /**
   * Complete purchase after payment success
   * POST /api/purchases/complete-purchase
   *
   * @example
   * ```typescript
   * // Called after Stripe/PayPal payment success
   * const result = await client.purchases.completePurchase({
   *   orderId: 'ORDER-1234567890-ABCDEFGHI',
   *   paymentReference: 'pi_stripe_payment_intent_id'
   * });
   *
   * console.log('License generated:', result.license.licenseKey);
   * console.log('Expires:', result.license.expiresAt);
   *
   * // Store license info
   * localStorage.setItem('licenseKey', result.license.licenseKey);
   * ```
   */
  async completePurchase(
    request: CompletePurchaseRequest,
    options?: { idempotencyKey?: string }
  ): Promise<CompletePurchaseResponse> {
    return this.http.post<CompletePurchaseResponse>(
      API_ENDPOINTS.PURCHASES.COMPLETE,
      request,
      this.buildIdempotencyConfig(options)
    );
  }

  /**
   * Get order details by ID
   * GET /api/purchases/order/:orderId
   *
   * @example
   * ```typescript
   * const order = await client.purchases.getOrder('ORDER-123...');
   * console.log('Status:', order.paymentStatus);
   * ```
   */
  async getOrder(orderId: string): Promise<PurchaseOrder> {
    const response = await this.http.get<{ order: PurchaseOrder }>(
      API_ENDPOINTS.PURCHASES.ORDER(orderId)
    );
    return response.order;
  }

  /**
   * Get all purchase orders (admin)
   * GET /api/purchases
   */
  async getAll(filters?: {
    status?: string;
    organizationId?: number;
    productCode?: string;
    limit?: number;
  }): Promise<PurchaseOrder[]> {
    const params: Record<string, string | number> = {};

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          params[key] = typeof value === 'number' ? value : String(value);
        }
      }
    }

    const response = await this.http.get<{ purchases: PurchaseOrder[] }>(
      API_ENDPOINTS.PURCHASES.BASE,
      Object.keys(params).length ? { params } : undefined
    );
    return response.purchases;
  }

  /**
   * Get all purchase orders with count (admin)
   * GET /api/purchases
   */
  async getAllSummary(limit?: number): Promise<{ purchases: PurchaseOrder[]; count: number }> {
    return this.http.get<{ purchases: PurchaseOrder[]; count: number }>(
      API_ENDPOINTS.PURCHASES.BASE,
      typeof limit === 'number' ? { params: { limit } } : undefined
    );
  }
}
