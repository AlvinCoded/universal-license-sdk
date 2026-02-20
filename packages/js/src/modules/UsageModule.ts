import type { HttpClient } from '../http/HttpClient';
import type {
  LicenseUsageSnapshotRequest,
  LicenseUsageSnapshotResponse,
  ReportLicenseUsageRequest,
  ReportLicenseUsageResponse,
} from '@unilic/core';
import { API_ENDPOINTS } from '@unilic/core';

/**
 * Usage snapshot operations (public app-key endpoints)
 * Fetch and report current usage counters tied to a license.
 */
export class UsageModule {
  constructor(private http: HttpClient) {}

  /**
   * Fetch current usage snapshot for a license.
   * POST /api/licenses/:licenseKey/usage
   */
  async getSnapshot(
    licenseKey: string,
    data: LicenseUsageSnapshotRequest
  ): Promise<LicenseUsageSnapshotResponse> {
    return this.http.post<LicenseUsageSnapshotResponse>(
      API_ENDPOINTS.LICENSES.USAGE_SNAPSHOT(licenseKey),
      data
    );
  }

  /**
   * Report current usage snapshot for a license.
   * POST /api/licenses/:licenseKey/usage/report
   */
  async reportSnapshot(
    licenseKey: string,
    data: ReportLicenseUsageRequest
  ): Promise<ReportLicenseUsageResponse> {
    return this.http.post<ReportLicenseUsageResponse>(
      API_ENDPOINTS.LICENSES.USAGE_REPORT(licenseKey),
      data
    );
  }
}
