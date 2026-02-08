import { useCallback, useEffect, useState } from 'react';
import { useLicenseContext } from '../context/LicenseContext';
import type {
  CreateOrganizationRequest,
  Organization,
  OrganizationWithLicensesResponse,
  UpdateOrganizationRequest,
} from '@unilic/client';

export function useOrganizations(options?: { auto?: boolean }) {
  const { client } = useLicenseContext();
  const auto = options?.auto ?? true;

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.organizations.getAll();
      setOrganizations(res);
      return res;
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch organizations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const getOrganization = useCallback(
    async (id: number): Promise<OrganizationWithLicensesResponse> => {
      setError(null);
      try {
        return await client.organizations.get(id);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch organization');
        throw err;
      }
    },
    [client]
  );

  const createOrganization = useCallback(
    async (request: CreateOrganizationRequest): Promise<Organization> => {
      setError(null);
      try {
        const org = await client.organizations.create(request);
        await fetchOrganizations();
        return org;
      } catch (err: any) {
        setError(err?.message || 'Failed to create organization');
        throw err;
      }
    },
    [client, fetchOrganizations]
  );

  const updateOrganization = useCallback(
    async (id: number, request: UpdateOrganizationRequest): Promise<Organization> => {
      setError(null);
      try {
        const org = await client.organizations.update(id, request);
        await fetchOrganizations();
        return org;
      } catch (err: any) {
        setError(err?.message || 'Failed to update organization');
        throw err;
      }
    },
    [client, fetchOrganizations]
  );

  const deleteOrganization = useCallback(
    async (id: number): Promise<void> => {
      setError(null);
      try {
        await client.organizations.delete(id);
        await fetchOrganizations();
      } catch (err: any) {
        setError(err?.message || 'Failed to delete organization');
        throw err;
      }
    },
    [client, fetchOrganizations]
  );

  useEffect(() => {
    if (!auto) return;
    void fetchOrganizations();
  }, [auto, fetchOrganizations]);

  return {
    organizations,
    loading,
    error,
    fetchOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    refetch: fetchOrganizations,
  };
}
