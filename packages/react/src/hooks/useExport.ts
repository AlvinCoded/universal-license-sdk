import { useCallback, useState } from 'react';
import { useLicenseContext } from '../context/LicenseContext';
import type { ExportFormat } from '@unilic/client';

export function useExport() {
  const { client } = useLicenseContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportLicenses = useCallback(
    async (format: ExportFormat) => {
      setLoading(true);
      setError(null);
      try {
        return await client.exports.exportLicenses(format);
      } catch (err: any) {
        const msg = err?.message || 'Failed to export licenses';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const exportPurchases = useCallback(
    async (format: ExportFormat) => {
      setLoading(true);
      setError(null);
      try {
        return await client.exports.exportPurchases(format);
      } catch (err: any) {
        const msg = err?.message || 'Failed to export purchases';
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
    exportLicenses,
    exportPurchases,
  };
}
