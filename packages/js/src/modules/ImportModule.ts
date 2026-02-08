import type { HttpClient } from '../http/HttpClient';
import type {
  ExportFormat,
  ImportDataType,
  ImportExecuteResponse,
  ImportMode,
  ImportPreviewResponse,
  ImportValidateResponse,
} from '@unilic/core';

/**
 * Import operations (admin)
 * Import endpoints.
 */
export class ImportModule {
  constructor(private http: HttpClient) {}

  private buildFormData(payload: {
    file: any;
    format?: ExportFormat;
    previewCount?: number;
    importMode?: ImportMode;
  }): FormData {
    const form = new FormData();
    form.append('file', payload.file);

    if (payload.format) form.append('format', payload.format);
    if (typeof payload.previewCount === 'number')
      form.append('previewCount', String(payload.previewCount));
    if (payload.importMode) form.append('importMode', payload.importMode);

    return form;
  }

  /** POST /api/import/:dataType/validate */
  async validate(
    dataType: ImportDataType,
    file: any,
    format?: ExportFormat
  ): Promise<ImportValidateResponse> {
    const form = this.buildFormData({ file, format });
    return this.http.postForm<ImportValidateResponse>(`/import/${dataType}/validate`, form);
  }

  /** POST /api/import/:dataType/preview */
  async preview(
    dataType: ImportDataType,
    file: any,
    options?: { format?: ExportFormat; previewCount?: number }
  ): Promise<ImportPreviewResponse> {
    const form = this.buildFormData({
      file,
      format: options?.format,
      previewCount: options?.previewCount,
    });
    return this.http.postForm<ImportPreviewResponse>(`/import/${dataType}/preview`, form);
  }

  /** POST /api/import/:dataType */
  async execute(
    dataType: ImportDataType,
    file: any,
    options?: { format?: ExportFormat; importMode?: ImportMode }
  ): Promise<ImportExecuteResponse> {
    const form = this.buildFormData({
      file,
      format: options?.format,
      importMode: options?.importMode,
    });
    return this.http.postForm<ImportExecuteResponse>(`/import/${dataType}`, form);
  }
}
