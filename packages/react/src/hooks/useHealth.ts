import { useCallback, useEffect, useState } from 'react';
import { useLicenseContext } from '../context/LicenseContext';
import type {
  DatabaseHealthResponse,
  EmailStatusResponse,
  HealthResponse,
} from '@universal-license/client';

export function useHealth(options?: { auto?: boolean }) {
  const { client } = useLicenseContext();
  const auto = options?.auto ?? true;

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [database, setDatabase] = useState<DatabaseHealthResponse | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatusResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.health.getHealth();
      setHealth(res);
      return res;
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch health');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const fetchDatabaseHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.health.getDatabaseHealth();
      setDatabase(res);
      return res;
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch database health');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const checkNow = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.health.checkNow();
      setDatabase(res);
      return res;
    } catch (err: any) {
      setError(err?.message || 'Failed to run health check');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const fetchEmailStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.health.getEmailStatus();
      setEmailStatus(res);
      return res;
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch email status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (!auto) return;
    void fetchHealth();
  }, [auto, fetchHealth]);

  return {
    health,
    database,
    emailStatus,
    loading,
    error,
    fetchHealth,
    fetchDatabaseHealth,
    fetchEmailStatus,
    checkNow,
  };
}
