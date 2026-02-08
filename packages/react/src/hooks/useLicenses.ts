import { useCallback, useEffect, useState } from 'react';
import { useLicenseContext } from '../context/LicenseContext';
import type {
  License,
  UpcomingRenewalsResponse,
  UpdateLicenseRenewalSettingsRequest,
  UpdateLicenseRenewalSettingsResponse,
  GetRenewalNotificationsResponse,
  TestEmailRequest,
  TestEmailResponse,
} from '@unilic/client';

export type LicenseFilters = {
  tier?: string;
  status?: string;
  productId?: number;
  productCode?: string;
  organizationId?: number;
  search?: string;
};

export function useLicenses(options?: { auto?: boolean; filters?: LicenseFilters }) {
  const { client } = useLicenseContext();
  const auto = options?.auto ?? true;

  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLicenses = useCallback(
    async (filters?: LicenseFilters) => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.licenses.getAll(filters);
        setLicenses(res);
        return res;
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch licenses');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const getLicense = useCallback(
    async (licenseKey: string): Promise<License> => {
      setError(null);
      try {
        return await client.licenses.get(licenseKey);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch license');
        throw err;
      }
    },
    [client]
  );

  const generateLicense = useCallback(
    async (request: Parameters<typeof client.licenses.generate>[0]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.licenses.generate(request);
        await fetchLicenses(options?.filters);
        return res;
      } catch (err: any) {
        setError(err?.message || 'Failed to generate license');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, fetchLicenses, options?.filters]
  );

  const revokeLicense = useCallback(
    async (licenseKey: string, reason: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.licenses.revoke(licenseKey, reason);
        await fetchLicenses(options?.filters);
        return res;
      } catch (err: any) {
        setError(err?.message || 'Failed to revoke license');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, fetchLicenses, options?.filters]
  );

  const deleteLicense = useCallback(
    async (licenseKey: string) => {
      setLoading(true);
      setError(null);
      try {
        await client.licenses.delete(licenseKey);
        await fetchLicenses(options?.filters);
      } catch (err: any) {
        setError(err?.message || 'Failed to delete license');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, fetchLicenses, options?.filters]
  );

  const renewLicense = useCallback(
    async (request: Parameters<typeof client.renewals.renew>[0]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.renewals.renew(request);
        await fetchLicenses(options?.filters);
        return res;
      } catch (err: any) {
        setError(err?.message || 'Failed to renew license');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, fetchLicenses, options?.filters]
  );

  const getUpcomingRenewals = useCallback(
    async (daysAhead: number = 90): Promise<License[]> => {
      setError(null);
      try {
        return await client.licenses.getUpcomingRenewals(daysAhead);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch upcoming renewals');
        throw err;
      }
    },
    [client]
  );

  const getUpcomingRenewalsSummary = useCallback(
    async (daysAhead: number = 90): Promise<UpcomingRenewalsResponse> => {
      setError(null);
      try {
        return await client.licenses.getUpcomingRenewalsSummary(daysAhead);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch upcoming renewals');
        throw err;
      }
    },
    [client]
  );

  const updateRenewalSettings = useCallback(
    async (
      licenseKey: string,
      request: UpdateLicenseRenewalSettingsRequest
    ): Promise<UpdateLicenseRenewalSettingsResponse> => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.licenses.updateRenewalSettings(licenseKey, request);
        await fetchLicenses(options?.filters);
        return res;
      } catch (err: any) {
        setError(err?.message || 'Failed to update renewal settings');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, fetchLicenses, options?.filters]
  );

  const getRenewalNotifications = useCallback(
    async (licenseKey: string): Promise<GetRenewalNotificationsResponse> => {
      setError(null);
      try {
        return await client.licenses.getRenewalNotifications(licenseKey);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch renewal notifications');
        throw err;
      }
    },
    [client]
  );

  const testEmail = useCallback(
    async (request: TestEmailRequest): Promise<TestEmailResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await client.licenses.testEmail(request);
      } catch (err: any) {
        setError(err?.message || 'Failed to test email');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  useEffect(() => {
    if (!auto) return;
    void fetchLicenses(options?.filters);
  }, [auto, fetchLicenses, options?.filters]);

  return {
    licenses,
    loading,
    error,
    fetchLicenses,
    refetch: fetchLicenses,
    getLicense,
    generateLicense,
    revokeLicense,
    deleteLicense,
    renewLicense,
    getUpcomingRenewals,
    getUpcomingRenewalsSummary,
    updateRenewalSettings,
    getRenewalNotifications,
    testEmail,
  };
}
