# Dashboard Integration Example

Display license information in your application dashboard.

## Overview

This example demonstrates:

- Reading the last successful validation from `localStorage` (works offline)
- Optionally refreshing validation online via `client.validation.validate()`
- Displaying license tier, features, and expiration
- Feature gating with `features: Record<string, boolean>`

This example assumes you already store `licenseKey` and `deviceId` in `localStorage` (see
[Basic Validation](/examples/basic-validation)).

## Complete Implementation

```ts
import { LicenseClient } from '@unilic/client';

const client = new LicenseClient({
  baseUrl: 'https://license-server.example.com/api',
});

type StoredValidation = {
  licenseKey: string;
  deviceId: string;
  validatedAt: string;
  license: {
    licenseKey: string;
    tier: string;
    features: Record<string, boolean>;
    maxUsers?: number;
    orgName: string;
    productCode: string;
    expiresAt: string;
  };
  signature?: string;
};

const VALIDATION_STORAGE_KEY = 'uls:lastValidation';

function loadStoredValidation(): StoredValidation | null {
  try {
    const raw = localStorage.getItem(VALIDATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredValidation(data: StoredValidation) {
  localStorage.setItem(VALIDATION_STORAGE_KEY, JSON.stringify(data));
}

function hasFeature(license: StoredValidation['license'], featureKey: string) {
  return license?.features?.[featureKey] === true;
}

function getDaysUntilExpiration(expiresAt: string) {
  const expiration = new Date(expiresAt);
  const today = new Date();
  const days = Math.ceil((+expiration - +today) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

async function maybeRefreshValidation(): Promise<void> {
  const licenseKey = localStorage.getItem('licenseKey');
  const deviceId = localStorage.getItem('deviceId');
  if (!licenseKey || !deviceId) return;

  if (!navigator.onLine) return;

  const result = await client.validation.validate({ licenseKey, deviceId });
  if (!result.valid || !result.license) return;

  saveStoredValidation({
    licenseKey,
    deviceId,
    validatedAt: new Date().toISOString(),
    license: result.license,
    signature: result.signature,
  });
}

async function getCurrentLicense(): Promise<StoredValidation['license'] | null> {
  // Use stored validation (works offline).
  const stored = loadStoredValidation();
  if (stored?.license) return stored.license;
  return null;
}

export async function renderLicenseDashboard(): Promise<string> {
  // Optional: refresh in the background (best effort)
  try {
    await maybeRefreshValidation();
  } catch {
    // ignore - dashboard can still render from stored validation
  }

  const license = await getCurrentLicense();

  if (!license) {
    return `
      <div style="padding: 20px; text-align: center;">
        <p>No license detected. Please activate your license.</p>
        <a href="/activate">Activate License</a>
      </div>
    `;
  }

  const daysLeft = getDaysUntilExpiration(license.expiresAt);

  const tierColors: Record<string, string> = {
    free: '#888',
    starter: '#3b82f6',
    pro: '#8b5cf6',
    enterprise: '#ec4899',
  };

  const featureList = [
    { key: 'advancedReporting', label: 'Advanced Reporting' },
    { key: 'customBranding', label: 'Custom Branding' },
    { key: 'apiAccess', label: 'API Access' },
    { key: 'dedicatedSupport', label: 'Dedicated Support' },
    { key: 'sso', label: 'Single Sign-On (SSO)' },
    { key: 'auditLogs', label: 'Audit Logs' },
  ];

  const featuresHtml = featureList
    .map((f) => {
      const enabled = hasFeature(license, f.key);
      const icon = enabled ? '✓' : '✗';
      const color = enabled ? '#10b981' : '#d1d5db';
      return `
        <div style="padding: 12px; border: 1px solid #e5e7eb; border-radius: 4px;">
          <span style="color: ${color}; font-weight: bold;">${icon}</span>
          <span style="margin-left: 8px;">${f.label}</span>
        </div>
      `;
    })
    .join('');

  const expirationWarning =
    daysLeft === 0
      ? `
        <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 12px; border-radius: 4px;">
          <strong>License Expired</strong>
          <p>Your license expired on ${new Date(license.expiresAt).toLocaleDateString()}</p>
          <a href="/renew">Renew Now</a>
        </div>
      `
      : daysLeft <= 30
        ? `
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px;">
            <strong>License Expires Soon</strong>
            <p>Your license expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}</p>
            <a href="/renew">Renew Your License</a>
          </div>
        `
        : '';

  return `
    <div style="max-width: 800px; margin: 20px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2>License Information</h2>

      <div style="margin: 20px 0;">
        <h3>Plan Tier</h3>
        <div style="background: ${tierColors[license.tier] || '#888'}; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; display: inline-block;">
          ${license.tier.toUpperCase()}
        </div>
      </div>

      <div style="margin: 20px 0;">
        <h3>License Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>License Key:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-family: monospace;">${license.licenseKey}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Organization:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${license.orgName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Max Users:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${license.maxUsers ?? '-'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Expires:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date(license.expiresAt).toLocaleDateString()}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 20px 0;">
        <h3>Features</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">${featuresHtml}</div>
      </div>

      <div style="margin: 20px 0;">${expirationWarning}</div>
    </div>
  `;
}
```

## React Component Example

```tsx
import React, { useEffect, useMemo, useState } from 'react';
import { LicenseClient } from '@unilic/client';

type StoredValidation = {
  license: {
    licenseKey: string;
    tier: string;
    features: Record<string, boolean>;
    maxUsers?: number;
    orgName: string;
    productCode: string;
    expiresAt: string;
  };
};

const VALIDATION_STORAGE_KEY = 'uls:lastValidation';

function loadStoredLicense() {
  try {
    const raw = localStorage.getItem(VALIDATION_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredValidation) : null;
    return parsed?.license ?? null;
  } catch {
    return null;
  }
}

export default function LicenseDashboard() {
  const client = useMemo(
    () => new LicenseClient({ baseUrl: 'https://license-server.example.com/api' }),
    []
  );

  const [license, setLicense] = useState<ReturnType<typeof loadStoredLicense> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      setLicense(loadStoredLicense());

      // Best-effort refresh (optional)
      const licenseKey = localStorage.getItem('licenseKey');
      const deviceId = localStorage.getItem('deviceId');
      if (licenseKey && deviceId && navigator.onLine) {
        const result = await client.validation.validate({ licenseKey, deviceId });
        if (result.valid && result.license) {
          localStorage.setItem(VALIDATION_STORAGE_KEY, JSON.stringify({ license: result.license }));
          setLicense(result.license);
        }
      }

      setLoading(false);
    }

    run().catch(() => setLoading(false));
  }, [client]);

  if (loading) return <div>Loading...</div>;
  if (!license) return <div>No license found</div>;

  const tierColors: Record<string, string> = {
    free: 'bg-gray-500',
    starter: 'bg-blue-500',
    pro: 'bg-purple-500',
    enterprise: 'bg-pink-500',
  };

  const daysLeft = Math.ceil(
    (new Date(license.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const featureCards = [
    { key: 'advancedReporting', label: 'Advanced Reporting' },
    { key: 'customBranding', label: 'Custom Branding' },
    { key: 'apiAccess', label: 'API Access' },
    { key: 'dedicatedSupport', label: 'Dedicated Support' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">License Dashboard</h2>

      <div className="mb-6">
        <span
          className={`${tierColors[license.tier] ?? 'bg-gray-500'} text-white px-4 py-2 rounded font-bold`}
        >
          {license.tier.toUpperCase()}
        </span>
      </div>

      <div className="mb-6 border rounded p-4">
        <h3 className="text-lg font-semibold mb-4">License Details</h3>
        <table className="w-full text-left">
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-semibold">License Key</td>
              <td className="py-2 font-mono text-sm">{license.licenseKey}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-semibold">Organization</td>
              <td className="py-2">{license.orgName}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-semibold">Max Users</td>
              <td className="py-2">{license.maxUsers ?? '-'}</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold">Expires</td>
              <td className="py-2">{new Date(license.expiresAt).toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Features</h3>
        <div className="grid grid-cols-2 gap-3">
          {featureCards.map((feature) => {
            const enabled = license.features?.[feature.key] === true;
            return (
              <div
                key={feature.key}
                className={`p-3 border rounded ${
                  enabled ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'
                }`}
              >
                <span className={enabled ? 'text-green-600 font-bold' : 'text-gray-400'}>
                  {enabled ? '✓' : '✗'}
                </span>
                <span className="ml-2">{feature.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {daysLeft <= 30 && (
        <div
          className={`p-4 rounded mb-6 ${
            daysLeft <= 0
              ? 'bg-red-50 border border-red-300'
              : 'bg-yellow-50 border border-yellow-300'
          }`}
        >
          <p className={daysLeft <= 0 ? 'text-red-800' : 'text-yellow-800'}>
            {daysLeft <= 0
              ? 'Your license has expired'
              : `Your license expires in ${daysLeft} days`}
          </p>
          <a href="/renew" className="text-blue-600 hover:underline">
            Renew Now
          </a>
        </div>
      )}
    </div>
  );
}
```

## Next Steps

- [Basic Validation](/examples/basic-validation) — Validate on startup
- [Onboarding Flow](/examples/onboarding-flow) — License activation
- [Payment Integration](/examples/payment-integration) — Purchase flow
