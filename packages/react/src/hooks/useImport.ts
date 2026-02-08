import { useCallback, useState } from 'react';
import { useLicenseContext } from '../context/LicenseContext';
import type {
  ExportFormat,
  ImportDataType,
  ImportExecuteResponse,
  ImportMode,
  ImportPreviewResponse,
  ImportValidateResponse,
} from '@universal-license/client';

export function useImport() {
  const { client } = useLicenseContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    async (
      dataType: ImportDataType,
      file: any,
      format?: ExportFormat
    ): Promise<ImportValidateResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await client.imports.validate(dataType, file, format);
      } catch (err: any) {
        const msg = err?.message || 'Failed to validate import file';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const preview = useCallback(
    async (
      dataType: ImportDataType,
      file: any,
      options?: { format?: ExportFormat; previewCount?: number }
    ): Promise<ImportPreviewResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await client.imports.preview(dataType, file, options);
      } catch (err: any) {
        const msg = err?.message || 'Failed to preview import file';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const execute = useCallback(
    async (
      dataType: ImportDataType,
      file: any,
      options?: { format?: ExportFormat; importMode?: ImportMode }
    ): Promise<ImportExecuteResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await client.imports.execute(dataType, file, options);
      } catch (err: any) {
        const msg = err?.message || 'Failed to execute import';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return {
    loading,
    error,
    validate,
    preview,
    execute,
  };
}
