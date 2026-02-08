import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { LicenseProvider } from '../../src/context/LicenseContext';
import { useLicense } from '../../src/hooks/useLicense';
import { LicenseClient } from '@universal-license/client';
import type { License } from '@universal-license/client';

let mockClient: any;

vi.mock('@universal-license/client', () => {
  class LicenseClient {
    constructor(_config: any) {
      return mockClient;
    }
  }

  return { LicenseClient };
});

describe('useLicense', () => {
  const mockLicense: License = {
    id: 1,
    license_key: 'TEST-ORG-2025-A1B2-C3D4-E5F6',
    org_id: 1,
    org_name: 'Test Organization',
    product_code: 'TEST-PROD',
    tier: 'pro',
    status: 'active',
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    max_users: 10,
    features: { feature1: true },
    issued_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LicenseProvider
      config={{
        baseUrl: 'http://localhost:3001/api',
        cache: true,
      }}
    >
      {children}
    </LicenseProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = {
      licenses: {
        get: vi.fn(),
      },
    };
  });

  it('should fetch and return license data', async () => {
    const mockGet = vi.fn().mockResolvedValue(mockLicense);
    mockClient = { licenses: { get: mockGet } };

    const { result } = renderHook(() => useLicense(mockLicense.license_key), { wrapper });

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.license).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.license).toEqual(mockLicense);
    expect(result.current.error).toBeNull();
    expect(mockGet).toHaveBeenCalledWith(mockLicense.license_key);
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Failed to fetch license');
    const mockGet = vi.fn().mockRejectedValue(mockError);
    mockClient = { licenses: { get: mockGet } };

    const { result } = renderHook(() => useLicense(mockLicense.license_key), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.license).toBeNull();
    expect(result.current.error).toBe('Failed to fetch license');
  });

  it('should not fetch when licenseKey is null', async () => {
    const mockGet = vi.fn();
    mockClient = { licenses: { get: mockGet } };

    const { result } = renderHook(() => useLicense(null), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGet).not.toHaveBeenCalled();
    expect(result.current.license).toBeNull();
  });

  it('should refetch license when refetch is called', async () => {
    const mockGet = vi.fn().mockResolvedValue(mockLicense);
    mockClient = { licenses: { get: mockGet } };

    const { result } = renderHook(() => useLicense(mockLicense.license_key), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Call refetch
    result.current.refetch();

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });
});
