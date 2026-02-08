import type { HttpClient } from '../http/HttpClient';
import type {
  CreateOrganizationRequest,
  Organization,
  OrganizationWithLicensesResponse,
  UpdateOrganizationRequest,
} from '@unilic/core';

/**
 * Organization operations (admin)
 * Organization management endpoints.
 */
export class OrganizationModule {
  constructor(private http: HttpClient) {}

  /** GET /api/organizations */
  async getAll(): Promise<Organization[]> {
    const res = await this.http.get<{ organizations: Organization[] }>('/organizations');
    return res.organizations;
  }

  /** GET /api/organizations/:id */
  async get(id: number): Promise<OrganizationWithLicensesResponse> {
    return this.http.get<OrganizationWithLicensesResponse>(`/organizations/${id}`);
  }

  /** POST /api/organizations */
  async create(request: CreateOrganizationRequest): Promise<Organization> {
    const res = await this.http.post<{ organization: Organization }>('/organizations', request);
    return res.organization;
  }

  /** PUT /api/organizations/:id */
  async update(id: number, request: UpdateOrganizationRequest): Promise<Organization> {
    const res = await this.http.put<{ organization: Organization }>(
      `/organizations/${id}`,
      request
    );
    return res.organization;
  }

  /** DELETE /api/organizations/:id */
  async delete(
    id: number
  ): Promise<{ success: boolean; message: string } | { success: boolean } | any> {
    return this.http.delete(`/organizations/${id}`);
  }
}
