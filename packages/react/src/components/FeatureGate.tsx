import { ReactNode } from 'react';
import { useFeatureFlag } from '../hooks/useFeatureFlag';

/**
 * FeatureGate Component
 * Show/hide UI based on license features
 *
 * Used throughout your app to gate premium features
 * Matches the pattern from your frontend components
 *
 * @example
 * ```tsx
 * <FeatureGate
 *   feature="advancedReporting"
 *   fallback={<UpgradeButton />}
 * >
 *   <AdvancedReportsUI />
 * </FeatureGate>
 * ```
 */
interface FeatureGateProps {
  feature: string;
  licenseKey?: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  children: ReactNode;
}

export function FeatureGate({
  feature,
  licenseKey,
  fallback = null,
  loadingFallback = null,
  children,
}: FeatureGateProps) {
  const hasFeature = useFeatureFlag(feature, licenseKey);

  // While loading, optionally show loading state
  if (loadingFallback && hasFeature === undefined) {
    return <>{loadingFallback}</>;
  }

  if (!hasFeature) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
