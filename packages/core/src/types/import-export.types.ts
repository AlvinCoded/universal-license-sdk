/**
 * Import/Export types
 * Import/export-related API types.
 */

export type ExportFormat = 'csv' | 'json' | 'xlsx';

export type ImportDataType = 'licenses' | 'purchases' | 'organizations' | 'products';

export type ImportMode = 'skip' | 'update' | 'fail';

export interface ImportValidateResponse {
  valid: boolean;
  summary: {
    totalRows: number;
    imported: number;
    failed: number;
  };
  errors: any[];
  warnings: any[];
  message: string;
}

export interface ImportPreviewResponse {
  format: ExportFormat;
  previewCount: number;
  records: any[];
}

export interface ImportExecuteResponse {
  success?: boolean;
  message?: string;
  imported?: number;
  failed?: number;
  errors?: any[];
  warnings?: any[];
}
