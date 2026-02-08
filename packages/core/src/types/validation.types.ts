/**
 * Extended validation types
 * These integrate with the backend ValidationService
 */

import type { License, LicenseTier } from './license.types';

/**
 * Validation Result
 * Comprehensive result from license validation
 */
export interface ValidationResult {
  valid: boolean;
  license?: License;
  signature?: string;
  validatedAt: string;
  expiresAt?: string;

  // Validation details
  checks: {
    licenseExists: boolean;
    licenseActive: boolean;
    notExpired: boolean;
    tierMatch: boolean;
    featuresMatch: boolean;
    deviceAuthorized: boolean;
  };

  // Error information
  error?: string;
  reason?: string;

  // Feature/tier mismatches
  missingFeatures?: string[];
  currentTier?: LicenseTier;
  requiredTier?: LicenseTier;
}

/**
 * Validation Options
 * Configure validation behavior
 */
export interface ValidationOptions {
  /** Allow expired licenses (for grace period) */
  allowExpired?: boolean;

  /** Grace period in days after expiration */
  gracePeriodDays?: number;

  /** Cache validation result */
  useCache?: boolean;

  /** Perform offline validation */
  offlineMode?: boolean;

  /** Strict tier checking */
  strictTierCheck?: boolean;

  /** Required features must all be present */
  strictFeatureCheck?: boolean;
}

/**
 * Device Authorization
 */
export interface DeviceAuthorization {
  deviceId: string;
  licenseKey: string;
  authorizedAt: string;
  lastUsedAt: string;
  active: boolean;
}

/**
 * Validation Cache Entry
 */
export interface ValidationCacheEntry {
  licenseKey: string;
  deviceId: string;
  result: ValidationResult;
  cachedAt: string;
  expiresAt: string;
}
