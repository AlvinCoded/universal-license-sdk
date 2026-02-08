import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LicenseProvider } from '../../src/context/LicenseContext';
import { FeatureGate } from '../../src/components/FeatureGate';
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

describe('FeatureGate', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LicenseProvider
      config={{
        baseUrl: 'http://localhost:3001/api',
      }}
    >
      {children}
    </LicenseProvider>
  );

  it('should render children when feature is enabled', async () => {
    localStorage.setItem('licenseKey', 'TEST-KEY');

    const mockHasFeature = vi.fn().mockResolvedValue(true);
    mockClient = { licenses: { hasFeature: mockHasFeature } };

    render(
      <FeatureGate feature="advancedReporting">
        <div>Advanced Reports</div>
      </FeatureGate>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Advanced Reports')).toBeInTheDocument();
    });
  });

  it('should show fallback when feature is disabled', async () => {
    localStorage.setItem('licenseKey', 'TEST-KEY');

    const mockHasFeature = vi.fn().mockResolvedValue(false);
    mockClient = { licenses: { hasFeature: mockHasFeature } };

    render(
      <FeatureGate feature="advancedReporting" fallback={<div>Upgrade Required</div>}>
        <div>Advanced Reports</div>
      </FeatureGate>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Upgrade Required')).toBeInTheDocument();
    });

    expect(screen.queryByText('Advanced Reports')).not.toBeInTheDocument();
  });

  it('should show fallback when no license key', async () => {
    render(
      <FeatureGate feature="advancedReporting" fallback={<div>No License</div>}>
        <div>Advanced Reports</div>
      </FeatureGate>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('No License')).toBeInTheDocument();
    });
  });
});
