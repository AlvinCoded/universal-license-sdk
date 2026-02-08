import type { HttpClient } from '../http/HttpClient';
import type { LicenseCache } from '../cache/LicenseCache';
import type {
  CreatePlanRequest,
  CreateProductRequest,
  Product,
  SubscriptionPlan,
  UpdatePlanRequest,
  UpdateProductRequest,
} from '@universal-license/core';
import { API_ENDPOINTS, CACHE_KEYS, DEFAULT_CONFIG } from '@universal-license/core';

/**
 * Product and subscription plan operations
 */
export class ProductModule {
  constructor(
    private http: HttpClient,
    private cache?: LicenseCache
  ) {}

  /**
   * Get all products
   * GET /api/products
   *
   * @example
   * ```typescript
   * const products = await client.products.getAll();
   * products.forEach(product => {
   *   console.log(`${product.productName} (${product.productCode})`);
   * });
   * ```
   */
  async getAll(): Promise<Product[]> {
    const response = await this.http.get<{ products: Product[] }>(API_ENDPOINTS.PRODUCTS.LIST);
    return response.products;
  }

  /**
   * Get product by code
   * GET /api/products/:productCode
   */
  async get(productCode: string): Promise<Product> {
    const products = await this.getAll();
    const product = products.find((item) => item.product_code === productCode);

    if (!product) {
      throw new Error(`Product not found: ${productCode}`);
    }

    return product;
  }

  /**
   * Get subscription plans for a product
   * GET /api/purchases/plans/:productCode
   *
   * @example
   * ```typescript
   * // For pricing page
   * const plans = await client.products.getPlans('PROD');
   *
   * plans.forEach(plan => {
   *   console.log(`${plan.planName}: $${plan.priceAmount}`);
   *   console.log('Features:', plan.features);
   *   console.log('Duration:', plan.durationDays, 'days');
   * });
   * ```
   */
  async getPlans(productCode: string): Promise<SubscriptionPlan[]> {
    // Try cache first (for pricing page performance)
    const cacheKey = CACHE_KEYS.PLANS(productCode);

    if (this.cache) {
      const cached = await this.cache.storage.get<SubscriptionPlan[]>(cacheKey);
      if (cached) return cached;
    }

    const response = await this.http.get<{ plans: SubscriptionPlan[] }>(
      API_ENDPOINTS.PURCHASES.PLANS(productCode)
    );

    // Cache plans (they don't change often)
    if (this.cache && response.plans) {
      await this.cache.storage.set(cacheKey, response.plans, DEFAULT_CONFIG.CACHE_TTL);
    }

    return response.plans;
  }

  /**
   * Get subscription plans for a product (admin)
   * GET /api/products/:productCode/plans
   */
  async getPlansForProductAdmin(productCode: string): Promise<SubscriptionPlan[]> {
    const response = await this.http.get<{ plans: SubscriptionPlan[] }>(
      `${API_ENDPOINTS.PRODUCTS.BASE}/${encodeURIComponent(productCode)}/plans`
    );
    return response.plans;
  }

  /**
   * Get specific plan by code
   * GET /api/plans/:planCode
   *
   * @example
   * ```typescript
   * const plan = await client.products.getPlan('PROD-PRO-ANNUAL');
   * console.log('Price:', plan.priceAmount, plan.priceCurrency);
   * console.log('Tier:', plan.tier);
   * ```
   */
  async getPlan(planCode: string): Promise<SubscriptionPlan> {
    const response = await this.http.get<{ plan: SubscriptionPlan }>(`/plans/${planCode}`);
    return response.plan;
  }

  /**
   * Create a new product (admin)
   * POST /api/products/create
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await this.http.post<{ product: Product }>(
      `${API_ENDPOINTS.PRODUCTS.BASE}/create`,
      data
    );
    return response.product;
  }

  /**
   * Update a product (admin)
   * PATCH /api/products/:id
   */
  async updateProduct(id: number, data: UpdateProductRequest): Promise<Product> {
    const response = await this.http.patch<{ product: Product }>(
      `${API_ENDPOINTS.PRODUCTS.BASE}/${id}`,
      data
    );
    return response.product;
  }

  /**
   * Delete a product (admin)
   * DELETE /api/products/:id
   */
  async deleteProduct(id: number): Promise<{ success: boolean; message: string }> {
    return this.http.delete(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`);
  }

  /**
   * Create a subscription plan (admin)
   * POST /api/products/plans/create
   */
  async createPlan(data: CreatePlanRequest): Promise<SubscriptionPlan> {
    const response = await this.http.post<{ plan: SubscriptionPlan }>(
      `${API_ENDPOINTS.PRODUCTS.BASE}/plans/create`,
      data
    );

    // Clear cached plans for this product
    if (this.cache && response.plan?.product_code) {
      const cacheKey = CACHE_KEYS.PLANS(response.plan.product_code);
      await this.cache.storage.remove(cacheKey);
    }

    return response.plan;
  }

  /**
   * Update a subscription plan (admin)
   * PATCH /api/products/plans/:id
   */
  async updatePlan(id: number, data: UpdatePlanRequest): Promise<SubscriptionPlan> {
    const response = await this.http.patch<{ plan: SubscriptionPlan }>(
      `${API_ENDPOINTS.PRODUCTS.BASE}/plans/${id}`,
      data
    );
    return response.plan;
  }

  /**
   * Delete a subscription plan (admin)
   * DELETE /api/products/plans/:id
   */
  async deletePlan(id: number): Promise<{ success: boolean; message: string }> {
    return this.http.delete(`${API_ENDPOINTS.PRODUCTS.BASE}/plans/${id}`);
  }
}
