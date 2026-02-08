import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { LicenseProvider } from '../../src/context/LicenseContext';
import { useHealth } from '../../src/hooks/useHealth';
import { LicenseClient } from '@universal-license/client';

let mockClient: any;

vi.mock('@universal-license/client', () => {
  class LicenseClient {
    constructor(_config: any) {
      return mockClient;
    }
  }

  return { LicenseClient };
});

describe('useHealth', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LicenseProvider config={{ baseUrl: 'http://localhost:3001/api', cache: false }}>
      {children}
    </LicenseProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = {
      health: {
        getHealth: vi.fn(),
        getDatabaseHealth: vi.fn(),
        checkNow: vi.fn(),
        getEmailStatus: vi.fn(),
      },
    };
  });

  it('auto-fetches /health by default', async () => {
    const mockHealth = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: 'test',
      environment: 'test',
      database: { connected: true },
    };

    const mockGetHealth = vi.fn().mockResolvedValue(mockHealth);
    mockClient = {
      health: {
        getHealth: mockGetHealth,
        getDatabaseHealth: vi.fn(),
        checkNow: vi.fn(),
        getEmailStatus: vi.fn(),
      },
    };

    const { result } = renderHook(() => useHealth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.health).toEqual(mockHealth);
    expect(result.current.error).toBeNull();
    expect(mockGetHealth).toHaveBeenCalledTimes(1);
  });

  it('does not auto-fetch when auto=false', async () => {
    const mockGetHealth = vi.fn();
    mockClient = {
      health: {
        getHealth: mockGetHealth,
        getDatabaseHealth: vi.fn(),
        checkNow: vi.fn(),
        getEmailStatus: vi.fn(),
      },
    };

    const { result } = renderHook(() => useHealth({ auto: false }), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetHealth).not.toHaveBeenCalled();
    expect(result.current.health).toBeNull();
  });
});
