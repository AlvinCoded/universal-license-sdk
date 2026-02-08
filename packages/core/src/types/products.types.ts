/**
 * Product and subscription plan types
 * Matches your backend Product and SubscriptionPlan types
 */

/**
 * Product Entity
 * Matches your backend products table
 */
export interface Product {
  id: number;
  product_code: string;
  product_name: string;
  description?: string;
  created_at: string;
  updated_at: string;

  // Optional joined data
  plans?: SubscriptionPlan[];
}

/**
 * Subscription Plan Entity
 * Matches your backend subscription_plans table
 */
export interface SubscriptionPlan {
  id: number;
  product_id: number;
  plan_code: string;
  plan_name: string;
  tier: 'standard' | 'pro' | 'enterprise';
  duration_days: number;
  max_users?: number;
  features: Record<string, boolean>;
  price_amount: number;
  price_currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Joined fields
  product_code?: string;
  product_name?: string;
}

/**
 * Create Product Request
 */
export interface CreateProductRequest {
  productCode: string;
  productName: string;
  description?: string;
}

/**
 * Update Product Request
 * PATCH /api/products/:id
 */
export interface UpdateProductRequest {
  productCode?: string;
  productName?: string;
  description?: string;
}

/**
 * Create Plan Request
 */
export interface CreatePlanRequest {
  productId: number;
  planCode: string;
  planName: string;
  tier: 'standard' | 'pro' | 'enterprise';
  durationDays: number;
  maxUsers?: number;
  features: Record<string, boolean>;
  priceAmount: number;
  priceCurrency: string;
}

/**
 * Update Plan Request
 * PATCH /api/products/plans/:id
 */
export interface UpdatePlanRequest {
  planCode?: string;
  planName?: string;
  tier?: 'standard' | 'pro' | 'enterprise';
  durationDays?: number;
  maxUsers?: number;
  features?: Record<string, boolean>;
  priceAmount?: number;
  priceCurrency?: string;
  isActive?: boolean;
}

/**
 * Feature Definition
 * Used to describe available features for a plan
 */
export interface FeatureDefinition {
  key: string;
  name: string;
  description: string;
  tier: 'standard' | 'pro' | 'enterprise';
  enabled: boolean;
}
