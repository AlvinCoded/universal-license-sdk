import type { HttpClient } from '../http/HttpClient';
import type { CreatePlanRequest, SubscriptionPlan } from '@unilic/core';

/**
 * Plan operations
 * Plan endpoints.
 */
export class PlanModule {
  constructor(private http: HttpClient) {}

  /** GET /api/plans (admin) */
  async getAll(): Promise<SubscriptionPlan[]> {
    const res = await this.http.get<{ plans: SubscriptionPlan[] }>('/plans');
    return res.plans;
  }

  /** GET /api/plans/:planCode */
  async get(planCode: string): Promise<SubscriptionPlan> {
    const res = await this.http.get<{ plan: SubscriptionPlan }>(
      `/plans/${encodeURIComponent(planCode)}`
    );
    return res.plan;
  }

  /** GET /api/plans/product/:productCode */
  async getByProduct(productCode: string): Promise<SubscriptionPlan[]> {
    const res = await this.http.get<{ plans: SubscriptionPlan[] }>(
      `/plans/product/${encodeURIComponent(productCode)}`
    );
    return res.plans;
  }

  /** POST /api/plans/create (admin) */
  async create(request: CreatePlanRequest): Promise<SubscriptionPlan> {
    const res = await this.http.post<{ plan: SubscriptionPlan }>('/plans/create', request);
    return res.plan;
  }

  /** DELETE /api/plans/:id (admin) */
  async delete(planId: number): Promise<{ success: boolean; message: string }> {
    return this.http.delete(`/plans/${planId}`);
  }
}
