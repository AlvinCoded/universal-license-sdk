import type { HttpClient } from '../http/HttpClient';
import type { DatabaseHealthResponse, EmailStatusResponse, HealthResponse } from '@unilic/core';

/**
 * Health/status operations
 * Health/status endpoints.
 */
export class HealthModule {
  constructor(private http: HttpClient) {}

  /** GET /api/health */
  async getHealth(): Promise<HealthResponse> {
    return this.http.get<HealthResponse>('/health');
  }

  /** GET /api/health/database */
  async getDatabaseHealth(): Promise<DatabaseHealthResponse> {
    return this.http.get<DatabaseHealthResponse>('/health/database');
  }

  /** POST /api/health/check */
  async checkNow(): Promise<DatabaseHealthResponse> {
    return this.http.post<DatabaseHealthResponse>('/health/check');
  }

  /** GET /api/health/email-status */
  async getEmailStatus(): Promise<EmailStatusResponse> {
    return this.http.get<EmailStatusResponse>('/health/email-status');
  }
}
