import { useState, useEffect } from 'react';
import { useLicenseContext } from '../context/LicenseContext';
import type { License } from '@unilic/client';

/**
 * useLicense Hook
 * Fetch and manage a single license
 *
 * @example
 * ```tsx
 * function LicenseDetails() {
 *   const { license, loading, error, refetch } = useLicense('PROD-ORG-2025-...');
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return <div>{license.orgName}</div>;
 * }
 * ```
 */
export function useLicense(licenseKey: string | null) {
  const { client } = useLicenseContext();
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLicense = async () => {
    if (!licenseKey) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await client.licenses.get(licenseKey);
      setLicense(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch license');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicense();
  }, [licenseKey]);

  return {
    license,
    loading,
    error,
    refetch: fetchLicense,
  };
}
