/**
 * React Integration Example
 * Shows how to use the SDK in a React application
 *
 * Example React integration.
 * - frontend/src/hooks/useLicenses.ts
 * - frontend/src/components/licenses/
 */

import React, { useEffect, useState } from 'react';
import { LicenseClient, DeviceFingerprint } from '@unilic/client';
import type { License, ValidateLicenseResponse } from '@unilic/client';

// Initialize SDK client (typically in a context provider)
const licenseClient = new LicenseClient({
  baseUrl: process.env.REACT_APP_LICENSE_API_URL || 'http://localhost:3001/api',
  cache: true,
});

/**
 * Custom hook for license validation
 * Similar to useLicenses hook in frontend/src/hooks/useLicenses.ts
 */
function useLicenseValidation(licenseKey: string | null) {
  const [validation, setValidation] = useState<ValidateLicenseResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!licenseKey) return;

    async function validateLicense() {
      setIsLoading(true);
      setError(null);

      try {
        const deviceId = await DeviceFingerprint.generate();

        const result = await licenseClient.validation.validate({
          licenseKey,
          deviceId,
        });

        setValidation(result);

        // Store license info in localStorage if valid
        if (result.valid && result.license) {
          localStorage.setItem('licenseKey', licenseKey);
          localStorage.setItem('licenseTier', result.license.tier);
          localStorage.setItem('licenseFeatures', JSON.stringify(result.license.features));
        }
      } catch (err: any) {
        setError(err.message || 'Validation failed');
      } finally {
        setIsLoading(false);
      }
    }

    validateLicense();
  }, [licenseKey]);

  return { validation, isLoading, error };
}

/**
 * License Input Component
 * Similar to onboarding flow in Holy Resource
 */
export function LicenseOnboarding() {
  const [licenseKey, setLicenseKey] = useState<string>('');
  const [submittedKey, setSubmittedKey] = useState<string | null>(null);
  const { validation, isLoading, error } = useLicenseValidation(submittedKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedKey(licenseKey.trim());
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Activate Your License</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="licenseKey" className="block text-sm font-medium mb-2">
            License Key
          </label>
          <input
            id="licenseKey"
            type="text"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="PROD-ORG-2025-XXXX-XXXX-XXXX"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={!licenseKey || isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Validating...' : 'Activate License'}
        </button>
      </form>

      {/* Validation Results */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {validation && !isLoading && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            validation.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {validation.valid ? (
            <>
              <h3 className="font-bold mb-2">✓ License Activated!</h3>
              <ul className="text-sm space-y-1">
                <li>Organization: {validation.license?.orgName}</li>
                <li>Tier: {validation.license?.tier}</li>
                <li>
                  Expires: {new Date(validation.license?.expiresAt || '').toLocaleDateString()}
                </li>
              </ul>
            </>
          ) : (
            <>
              <h3 className="font-bold mb-2">✗ Validation Failed</h3>
              <p className="text-sm">{validation.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Feature Guard Component
 * Conditionally renders content based on license features
 */
interface FeatureGuardProps {
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function FeatureGuard({ feature, fallback, children }: FeatureGuardProps) {
  const [hasFeature, setHasFeature] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    async function checkFeature() {
      const licenseKey = localStorage.getItem('licenseKey');

      if (!licenseKey) {
        setIsChecking(false);
        return;
      }

      try {
        const result = await licenseClient.licenses.hasFeature(licenseKey, feature);
        setHasFeature(result);
      } catch (error) {
        setHasFeature(false);
      } finally {
        setIsChecking(false);
      }
    }

    checkFeature();
  }, [feature]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  if (!hasFeature) {
    return <>{fallback || <UpgradePrompt feature={feature} />}</>;
  }

  return <>{children}</>;
}

/**
 * Upgrade Prompt Component
 */
function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
      <h3 className="text-lg font-semibold mb-2">Feature Locked</h3>
      <p className="text-gray-600 mb-4">
        The <strong>{feature}</strong> feature is not available in your current plan.
      </p>
      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Upgrade Plan
      </button>
    </div>
  );
}

/**
 * License Dashboard Component
 * Displays current license status and actions
 */
export function LicenseDashboard() {
  const [license, setLicense] = useState<License | null>(null);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadLicense() {
      const licenseKey = localStorage.getItem('licenseKey');

      if (!licenseKey) {
        setIsLoading(false);
        return;
      }

      try {
        const licenseData = await licenseClient.licenses.get(licenseKey);
        const days = await licenseClient.licenses.getDaysUntilExpiry(licenseKey);

        setLicense(licenseData);
        setDaysUntilExpiry(days);
      } catch (error) {
        console.error('Failed to load license:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadLicense();
  }, []);

  if (isLoading) {
    return <div>Loading license information...</div>;
  }

  if (!license) {
    return <LicenseOnboarding />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* License Status Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">License Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">License Key</p>
            <p className="font-mono">{license.license_key}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm ${
                license.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {license.status}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-600">Tier</p>
            <p className="font-semibold capitalize">{license.tier}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Expires</p>
            <p>{new Date(license.expires_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Expiry Warning */}
        {daysUntilExpiry !== null && daysUntilExpiry < 30 && (
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
            <strong>Renewal Reminder:</strong> Your license expires in {daysUntilExpiry} days.
            <button className="ml-4 text-blue-600 hover:underline">Renew Now</button>
          </div>
        )}
      </div>

      {/* Features Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Available Features</h3>

        <ul className="space-y-2">
          {Object.entries(license.features || {}).map(([feature, enabled]) => (
            <li key={feature} className="flex items-center gap-2">
              <span className={enabled ? 'text-green-600' : 'text-gray-400'}>
                {enabled ? '✓' : '✗'}
              </span>
              <span className={enabled ? '' : 'text-gray-400'}>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Example Usage in App
 */
export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <LicenseDashboard />

      {/* Protected Feature Example */}
      <div className="max-w-2xl mx-auto mt-6">
        <FeatureGuard feature="advancedReporting">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Advanced Reporting</h3>
            <p>This content is only visible to users with the advanced reporting feature.</p>
          </div>
        </FeatureGuard>
      </div>
    </div>
  );
}
