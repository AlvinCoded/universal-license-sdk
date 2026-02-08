/**
 * Base error class for all license-related errors
 */
export class LicenseError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'LicenseError';
    Object.setPrototypeOf(this, LicenseError.prototype);
  }
}

/**
 * Validation error (license invalid, expired, etc.)
 */
export class ValidationError extends LicenseError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Network error (connection issues, timeouts, etc.)
 */
export class NetworkError extends LicenseError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Purchase error (payment issues, order creation failures, etc.)
 */
export class PurchaseError extends LicenseError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'PurchaseError';
    Object.setPrototypeOf(this, PurchaseError.prototype);
  }
}
