import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { LicenseProvider } from '../../src/context/LicenseContext';
import { useLicenseValidation } from '../../src/hooks/useLicenseValidation';
import { LicenseClient, DeviceFingerprint } from '@unilic/client';

const hoisted = vi.hoisted(() => {
  let mockClient: any = {
    validation: {
      validate: vi.fn(),
    },
  };

  const mockGenerateFingerprint = vi.fn();

  return {
    getMockClient: () => mockClient,
    setMockClient: (next: any) => {
      mockClient = next;
    },
    mockGenerateFingerprint,
  };
});

vi.mock('@unilic/client', () => {
  class LicenseClient {
    constructor(_config: any) {
      return hoisted.getMockClient();
    }
  }

  return {
    LicenseClient,
    DeviceFingerprint: {
      generate: hoisted.mockGenerateFingerprint,
    },
  };
});

describe('useLicenseValidation', () => {
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
    localStorage.clear();
    hoisted.setMockClient({
      validation: {
        validate: vi.fn(),
      },
    });

    hoisted.mockGenerateFingerprint.mockResolvedValue('device-123');
  });

  it('should validate license successfully', async () => {
    const mockValidation = {
      valid: true,
      license: {
        tier: 'pro',
        features: { feature1: true },
      },
    };

    const mockValidate = vi.fn().mockResolvedValue(mockValidation);
    hoisted.setMockClient({ validation: { validate: mockValidate } });

    const { result } = renderHook(() => useLicenseValidation(), { wrapper });

    await act(async () => {
      await result.current.validate('TEST-KEY');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.validation).toEqual(mockValidation);
    expect(result.current.error).toBeNull();

    // Should store license info in localStorage
    expect(localStorage.getItem('licenseKey')).toBe('TEST-KEY');
    expect(localStorage.getItem('licenseTier')).toBe('pro');
  });

  it('should handle validation failure', async () => {
    const mockValidation = {
      valid: false,
      error: 'License expired',
    };

    const mockValidate = vi.fn().mockResolvedValue(mockValidation);
    hoisted.setMockClient({ validation: { validate: mockValidate } });

    const { result } = renderHook(() => useLicenseValidation(), { wrapper });

    await act(async () => {
      await result.current.validate('TEST-KEY');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.validation).toEqual(mockValidation);
    expect(localStorage.getItem('licenseKey')).toBeNull();
  });

  it('should use provided device ID', async () => {
    const mockValidate = vi.fn().mockResolvedValue({ valid: true });
    hoisted.setMockClient({ validation: { validate: mockValidate } });

    const { result } = renderHook(() => useLicenseValidation(), { wrapper });

    await act(async () => {
      await result.current.validate('TEST-KEY', {
        deviceId: 'custom-device-id',
      });
    });

    expect(mockValidate).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceId: 'custom-device-id',
      })
    );
  });
});
