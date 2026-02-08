/**
 * Purchase and order types
 * Matches your backend purchase order types
 */

/**
 * Payment Status
 */
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

/**
 * Purchase Order Entity
 * Matches your backend purchase_orders table
 */
export interface PurchaseOrder {
  id: number;
  order_id: string;
  organization_id: number;
  plan_id: number;
  amount: number;
  currency: string;
  payment_status: PaymentStatus;
  payment_reference?: string;
  license_id?: number;
  metadata?: Record<string, any>;
  created_at: string;
  completed_at?: string;

  // Joined fields
  org_name?: string;
  owner_name?: string;
  product_code?: string;
  product_name?: string;
  plan_code?: string;
  plan_name?: string;
  tier?: string;
  license_key?: string;
}

/**
 * Create Order Request
 * Matches your backend CreatePurchaseOrderRequest
 */
export interface CreateOrderRequest {
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
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

/**
 * Create Order Response
 */
export interface CreateOrderResponse {
  order: {
    orderId: string;
    amount: number;
    currency: string;
    planName: string;
    tier: string;
    status: PaymentStatus | string;
  };
  organization: {
    orgCode: string;
    orgName: string;
  };
}

/**
 * Complete Purchase Request
 * Matches your backend CompletePurchaseRequest
 */
export interface CompletePurchaseRequest {
  orderId: string;
  paymentReference: string;
}

/**
 * Complete Purchase Response
 * Matches your backend CompletePurchaseResponse
 */
export interface CompletePurchaseResponse {
  success: boolean;
  message: string;
  license: {
    licenseKey: string;
    tier: string;
    expiresAt: string;
    features: Record<string, boolean>;
    maxUsers?: number;
  };
  organization: {
    orgName: string;
    ownerName: string;
  };
}

/**
 * Purchase Filters
 */
export interface PurchaseFilters {
  status?: PaymentStatus;
  organizationId?: number;
  productCode?: string;
  startDate?: string;
  endDate?: string;
}
