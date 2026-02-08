/**
 * Core types index
 * Export all type definitions for easy importing
 */

// Common types
export * from './common.types';
export * from './auth.types';
export * from './license.types';
export * from './products.types';
export * from './purchase.types';
export * from './organization.types';
export * from './renewal.types';
export * from './validation.types';
export * from './activity.types';
export * from './payment.types';
export * from './import-export.types';
export * from './health.types';

// Type guards
export function isLicense(obj: any): obj is import('./license.types').License {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.license_key === 'string' &&
    typeof obj.tier === 'string' &&
    typeof obj.status === 'string'
  );
}

export function isValidationResponse(
  obj: any
): obj is import('./license.types').ValidateLicenseResponse {
  return typeof obj === 'object' && obj !== null && typeof obj.valid === 'boolean';
}

export function isPurchaseOrder(obj: any): obj is import('./purchase.types').PurchaseOrder {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.order_id === 'string' &&
    typeof obj.payment_status === 'string'
  );
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Dictionary<T> = Record<string, T>;

// Async operation result
export type AsyncResult<T, E = Error> = { success: true; data: T } | { success: false; error: E };
