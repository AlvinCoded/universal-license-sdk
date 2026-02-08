/**
 * Constants shared across all SDK packages
 * These mirror the constants from your frontend and backend
 */

import type { LicenseTier } from './types/license.types';

// License tiers
export const LICENSE_TIERS = {
  STANDARD: 'standard',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

// License tier hierarchy (for tier comparison)
export const LICENSE_TIER_HIERARCHY: Record<LicenseTier, number> = {
  [LICENSE_TIERS.STANDARD]: 1,
  [LICENSE_TIERS.PRO]: 2,
  [LICENSE_TIERS.ENTERPRISE]: 3,
};

// License statuses
export const LICENSE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
  SUSPENDED: 'suspended',
} as const;

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// API endpoints (relative paths)
export const API_ENDPOINTS = {
  LICENSES: {
    BASE: '/licenses',
    VALIDATE: '/licenses/validate',
    GENERATE: '/licenses/generate',
    STATS: '/licenses/stats/dashboard',
    PUBLIC_KEY: '/licenses/keys/public',
    UPCOMING_RENEWALS: '/licenses/renewals/upcoming',
    DETAILS: (key: string) => `/licenses/${key}`,
    OWNERSHIP: (key: string) => `/licenses/${key}/ownership`,
    CLAIM_OWNER: (key: string) => `/licenses/${key}/claim-owner`,
    INVITES_CREATE: (key: string) => `/licenses/${key}/invites`,
    INVITES_REDEEM: (key: string) => `/licenses/${key}/invites/redeem`,
    RENEW: (key: string) => `/licenses/${key}/renew`,
    REVOKE: (key: string) => `/licenses/${key}/revoke`,
    DELETE: (key: string) => `/licenses/${key}`,
    RENEWALS_HISTORY: (key: string) => `/licenses/${key}/renewals`,
    RENEWAL_SETTINGS: (key: string) => `/licenses/${key}/renewal-settings`,
    RENEWAL_NOTIFICATIONS: (key: string) => `/licenses/${key}/renewal-notifications`,
    TEST_EMAIL: '/licenses/test-email',
  },
  PURCHASES: {
    BASE: '/purchases',
    CREATE_ORDER: '/purchases/create-order',
    COMPLETE: '/purchases/complete-purchase',
    ORDER: (orderId: string) => `/purchases/order/${orderId}`,
    PLANS: (productCode: string) => `/purchases/plans/${productCode}`,
  },
  PRODUCTS: {
    BASE: '/products',
    LIST: '/products',
    CREATE: '/products/create',
    DETAILS: (code: string) => `/products/${code}`,
    DELETE: (id: number) => `/products/${id}`,
  },
  PLANS: {
    BASE: '/plans',
    CREATE: '/products/plans/create',
    DETAILS: (planCode: string) => `/plans/${planCode}`,
    DELETE: (id: number) => `/products/plans/${id}`,
  },
  ORGANIZATIONS: {
    BASE: '/organizations',
    CREATE: '/organizations',
    DETAILS: (id: number) => `/organizations/${id}`,
    UPDATE: (id: number) => `/organizations/${id}`,
    DELETE: (id: number) => `/organizations/${id}`,
  },
  RENEWAL: {
    REQUEST_LINK: '/renewal/request-magic-link',
    PROCESS: '/renewal/process',
    RENEW: '/renewal/process',
    VERIFY_TOKEN: (token: string) => `/renewal/verify-token/${token}`,
  },
  ACTIVITY: {
    LOGS: '/activity/logs',
    VALIDATION: (licenseKey: string) => `/activity/validation/${licenseKey}`,
  },
  HEALTH: '/health',
} as const;

// Default configuration
export const DEFAULT_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRIES: 3,
  CACHE_TTL: 3600000, // 1 hour in milliseconds
  CACHE_ENABLED: true,
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  LICENSE_KEY: /^[A-Z0-9]+-[A-Z]{3}-\d{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  PRODUCT_CODE: /^[A-Z0-9-]+$/,
  PLAN_CODE: /^[A-Z0-9]+-[A-Z0-9]+-[A-Z]+$/,
} as const;

// Error codes
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',

  // Validation errors
  INVALID_LICENSE: 'INVALID_LICENSE',
  LICENSE_EXPIRED: 'LICENSE_EXPIRED',
  LICENSE_REVOKED: 'LICENSE_REVOKED',
  INVALID_TIER: 'INVALID_TIER',
  MISSING_FEATURES: 'MISSING_FEATURES',

  // Purchase errors
  INVALID_PLAN: 'INVALID_PLAN',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',

  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Cache keys
export const CACHE_KEYS = {
  LICENSE: (key: string) => `license:${key}`,
  PRODUCT: (code: string) => `product:${code}`,
  PLANS: (productCode: string) => `plans:${productCode}`,
  VALIDATION: (key: string, deviceId: string) => `validation:${key}:${deviceId}`,
} as const;

// Feature flags
export const FEATURES = {
  SIGNATURE_VERIFICATION: true,
  OFFLINE_VALIDATION: true,
  AUTO_RETRY: true,
  CACHE_VALIDATION: true,
} as const;

// Limits and constraints
export const LIMITS = {
  MIN_LICENSE_KEY_LENGTH: 30,
  MAX_LICENSE_KEY_LENGTH: 50,
  MIN_ORG_NAME_LENGTH: 2,
  MAX_ORG_NAME_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MAX_DURATION_DAYS: 3650, // ~10 years
} as const;

// Storage keys (for localStorage/sessionStorage)
export const STORAGE_KEYS = {
  LICENSE_KEY: 'uls_license_key',
  DEVICE_ID: 'uls_device_id',
  CACHED_LICENSE: 'uls_cached_license',
  LAST_VALIDATION: 'uls_last_validation',
} as const;
