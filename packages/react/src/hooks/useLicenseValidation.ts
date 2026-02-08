import { useState, useCallback } from 'react';
import { useLicenseContext } from '../context/LicenseContext';
import { DeviceFingerprint } from '@unilic/client';
import type { LicenseTier, ValidateLicenseResponse } from '@unilic/client';

/**
 * useLicenseValidation Hook
 * Validate a license key with automatic device fingerprinting
 *
 * This is the most common operation - used during app onboarding
 *
 * @example
 * ```tsx
 * function OnboardingPage() {
 *   const [licenseKey, setLicenseKey] = useState('');
 *   const { validation, loading, error, validate } = useLicenseValidation();
 *
 *   const handleSubmit = () => {
 *     validate(licenseKey, {
 *       requiredTier: 'pro',
 *       requiredFeatures: ['advancedReporting']
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <input value={licenseKey} onChange={e => setLicenseKey(e.target.value)} />
 *       <button onClick={handleSubmit}>Validate</button>
 *       {validation?.valid && <div>License is valid!</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useLicenseValidation() {
  const { client } = useLicenseContext();
  const [validation, setValidation] = useState<ValidateLicenseResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    async (
      licenseKey: string,
      options?: {
        requiredTier?: LicenseTier;
        requiredFeatures?: string[];
        deviceId?: string;
      }
    ) => {
      setLoading(true);
      setError(null);

      try {
        const deviceId = options?.deviceId || (await DeviceFingerprint.generate());

        const result = await client.validation.validate({
          licenseKey,
          deviceId,
          requiredTier: options?.requiredTier,
          requiredFeatures: options?.requiredFeatures,
        });

        setValidation(result);

        // Store license info if valid (matches your frontend pattern)
        if (result.valid && result.license) {
          localStorage.setItem('licenseKey', licenseKey);
          localStorage.setItem('licenseTier', result.license.tier);
          localStorage.setItem('licenseFeatures', JSON.stringify(result.license.features));
        }

        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'Validation failed';
        setError(errorMessage);
        return {
          valid: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return {
    validation,
    loading,
    error,
    validate,
  };
}
