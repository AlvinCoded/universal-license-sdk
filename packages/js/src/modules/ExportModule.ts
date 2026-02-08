import type { HttpClient } from '../http/HttpClient';
import type { ExportFormat } from '@unilic/core';

/**
 * Export operations (admin)
 * Export endpoints.
 */
export class ExportModule {
  constructor(private http: HttpClient) {}

  /** GET /api/export/licenses/:format */
  async exportLicenses(format: ExportFormat): Promise<string | ArrayBuffer | any> {
    if (format === 'xlsx') {
      return this.http.get<ArrayBuffer>(`/export/licenses/${format}`, {
        responseType: 'arraybuffer',
      });
    }

    if (format === 'csv') {
      return this.http.get<string>(`/export/licenses/${format}`, { responseType: 'text' });
    }

    return this.http.get<any>(`/export/licenses/${format}`);
  }

  /** GET /api/export/purchases/:format */
  async exportPurchases(format: ExportFormat): Promise<string | ArrayBuffer | any> {
    if (format === 'xlsx') {
      return this.http.get<ArrayBuffer>(`/export/purchases/${format}`, {
        responseType: 'arraybuffer',
      });
    }

    if (format === 'csv') {
      return this.http.get<string>(`/export/purchases/${format}`, { responseType: 'text' });
    }

    return this.http.get<any>(`/export/purchases/${format}`);
  }
}
