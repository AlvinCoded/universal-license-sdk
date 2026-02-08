import type { HttpClient } from '../http/HttpClient';
import type { ActivityLog, GetActivityLogsResponse, GetValidationLogsResponse } from '@unilic/core';

/**
 * Activity/audit log operations (admin)
 * Activity and audit-log endpoints.
 */
export class ActivityModule {
  constructor(private http: HttpClient) {}

  /** GET /api/activity/logs?limit=100 */
  async getLogs(limit: number = 100): Promise<ActivityLog[]> {
    const res = await this.http.get<GetActivityLogsResponse>(`/activity/logs?limit=${limit}`);
    return res.logs;
  }

  /** GET /api/activity/validation/:licenseKey?limit=50 */
  async getValidationLogs(licenseKey: string, limit: number = 50) {
    const res = await this.http.get<GetValidationLogsResponse>(
      `/activity/validation/${encodeURIComponent(licenseKey)}?limit=${limit}`
    );
    return res.logs;
  }
}
