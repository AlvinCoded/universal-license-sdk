/**
 * @unilic/react
 * React hooks and components for Universal License SDK
 *
 * This is a thin wrapper around @unilic/client that provides
 * React-specific patterns like hooks and context.
 */

// Context & Provider
export { LicenseProvider, useLicenseContext } from './context/LicenseContext';

// Hooks
export { useLicense } from './hooks/useLicense';
export { useLicenseValidation } from './hooks/useLicenseValidation';
export { useProducts } from './hooks/useProducts';
export { usePurchase } from './hooks/usePurchase';
export { useFeatureFlag } from './hooks/useFeatureFlag';

// Dashboard-style convenience hooks
export { useLicenses } from './hooks/useLicenses';
export { useOrganizations } from './hooks/useOrganizations';
export { usePurchases } from './hooks/usePurchases';
export { useActivity } from './hooks/useActivity';
export { usePayment } from './hooks/usePayment';
export { useImport } from './hooks/useImport';
export { useExport } from './hooks/useExport';
export { useHealth } from './hooks/useHealth';

// Components
export { LicenseGuard } from './components/LicenseGuard';
export { FeatureGate } from './components/FeatureGate';

// Re-export types from client package
export type {
  License,
  ValidateLicenseRequest,
  ValidateLicenseResponse,
  Product,
  SubscriptionPlan,
  SDKConfig,
} from '@unilic/client';
