import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { LicenseProvider } from '../../src/context/LicenseContext';
import { useOrganizations } from '../../src/hooks/useOrganizations';
import { LicenseClient } from '@unilic/client';
import type { Organization } from '@unilic/client';

let mockClient: any;

vi.mock('@unilic/client', () => {
  class LicenseClient {
    constructor(_config: any) {
      return mockClient;
    }
  }

  return { LicenseClient };
});

describe('useOrganizations', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LicenseProvider config={{ baseUrl: 'http://localhost:3001/api', cache: false }}>
      {children}
    </LicenseProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = {
      organizations: {
        getAll: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
  });

  it('auto-fetches organizations by default', async () => {
    const orgs: Organization[] = [
      {
        id: 1,
        org_code: 'ORG-1',
        org_name: 'Org 1',
        owner_name: 'Owner',
        owner_email: 'owner@example.com',
        created_at: new Date().toISOString(),
      } as any,
    ];

    const mockGetAll = vi.fn().mockResolvedValue(orgs);
    mockClient = {
      organizations: {
        getAll: mockGetAll,
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const { result } = renderHook(() => useOrganizations(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.organizations).toEqual(orgs);
    expect(result.current.error).toBeNull();
    expect(mockGetAll).toHaveBeenCalledTimes(1);
  });

  it('does not auto-fetch when auto=false', async () => {
    const mockGetAll = vi.fn();
    mockClient = {
      organizations: {
        getAll: mockGetAll,
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const { result } = renderHook(() => useOrganizations({ auto: false }), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAll).not.toHaveBeenCalled();
  });
});
