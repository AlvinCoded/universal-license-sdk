import { ReactNode } from 'react';
import { useLicense } from '../hooks/useLicense';

/**
 * LicenseGuard Component
 * Conditionally render content based on license validity
 *
 * Protects routes and features based on license status
 *
 * @example
 * ```tsx
 * <LicenseGuard
 *   licenseKey={licenseKey}
 *   fallback={<RedirectToOnboarding />}
 *   loadingFallback={<LoadingSpinner />}
 * >
 *   <ProtectedContent />
 * </LicenseGuard>
 * ```
 */
interface LicenseGuardProps {
  licenseKey: string;
  requiredStatus?: string[];
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  children: ReactNode;
}

export function LicenseGuard({
  licenseKey,
  requiredStatus = ['active'],
  fallback = null,
  loadingFallback = <div>Loading...</div>,
  children,
}: LicenseGuardProps) {
  const { license, loading } = useLicense(licenseKey);

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (!license || !requiredStatus.includes(license.status)) {
    return <>{fallback}</>;
  }

  // Check if license is expired
  const isExpired = new Date(license.expires_at) < new Date();
  if (isExpired && !requiredStatus.includes('expired')) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
