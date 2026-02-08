import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LicenseProvider } from '../../src/context/LicenseContext';
import { LicenseGuard } from '../../src/components/LicenseGuard';
import { LicenseClient } from '@unilic/client';

let mockClient: any;

vi.mock('@unilic/client', () => {
  class LicenseClient {
    constructor(_config: any) {
      return mockClient;
    }
  }

  return { LicenseClient };
});

describe('LicenseGuard', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LicenseProvider
      config={{
        baseUrl: 'http://localhost:3001/api',
      }}
    >
      {children}
    </LicenseProvider>
  );

  it('should show loading fallback while loading', () => {
    const mockGet = vi.fn().mockReturnValue(new Promise(() => {})); // Never resolves
    mockClient = { licenses: { get: mockGet } };

    render(
      <LicenseGuard licenseKey="TEST-KEY" loadingFallback={<div>Loading...</div>}>
        <div>Protected Content</div>
      </LicenseGuard>,
      { wrapper }
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render children when license is valid', async () => {
    const mockLicense = {
      status: 'active',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };

    const mockGet = vi.fn().mockResolvedValue(mockLicense);
    mockClient = { licenses: { get: mockGet } };

    render(
      <LicenseGuard licenseKey="TEST-KEY">
        <div>Protected Content</div>
      </LicenseGuard>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should show fallback when license is invalid', async () => {
    const mockLicense = {
      status: 'expired',
      expires_at: new Date(Date.now() - 86400000).toISOString(),
    };

    const mockGet = vi.fn().mockResolvedValue(mockLicense);
    mockClient = { licenses: { get: mockGet } };

    render(
      <LicenseGuard licenseKey="TEST-KEY" fallback={<div>Access Denied</div>}>
        <div>Protected Content</div>
      </LicenseGuard>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
