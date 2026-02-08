import { useState, useEffect } from 'react';
import { useLicenseContext } from '../context/LicenseContext';

/**
 * useFeatureFlag Hook
 * Check if a license has a specific feature
 *
 * Used for feature gating throughout your application
 *
 * @example
 * ```tsx
 * function AdvancedReports() {
 *   const hasFeature = useFeatureFlag('advancedReporting');
 *
 *   if (!hasFeature) {
 *     return <UpgradePrompt />;
 *   }
 *
 *   return <ReportsUI />;
 * }
 * ```
 */
export function useFeatureFlag(feature: string, licenseKey?: string): boolean {
  const { client } = useLicenseContext();
  const [hasFeature, setHasFeature] = useState<boolean>(false);

  useEffect(() => {
    checkFeature();
  }, [feature, licenseKey]);

  const checkFeature = async () => {
    const key = licenseKey || localStorage.getItem('licenseKey');

    if (!key) {
      setHasFeature(false);
      return;
    }

    try {
      const result = await client.licenses.hasFeature(key, feature);
      setHasFeature(result);
    } catch {
      setHasFeature(false);
    }
  };

  return hasFeature;
}
