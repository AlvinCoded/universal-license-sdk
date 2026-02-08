import { useCallback, useEffect, useState } from 'react';
import { useLicenseContext } from '../context/LicenseContext';
import type { ActivityLog } from '@universal-license/client';

export function useActivity(options?: { auto?: boolean; limit?: number }) {
  const { client } = useLicenseContext();
  const auto = options?.auto ?? true;
  const limit = options?.limit ?? 100;

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (newLimit: number = limit) => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.activity.getLogs(newLimit);
        setLogs(res);
        return res;
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch activity logs');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, limit]
  );

  const fetchValidationLogs = useCallback(
    async (licenseKey: string, newLimit: number = 50) => {
      setError(null);
      try {
        return await client.activity.getValidationLogs(licenseKey, newLimit);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch validation logs');
        throw err;
      }
    },
    [client]
  );

  useEffect(() => {
    if (!auto) return;
    void fetchLogs(limit);
  }, [auto, fetchLogs, limit]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    fetchValidationLogs,
    refetch: fetchLogs,
  };
}
