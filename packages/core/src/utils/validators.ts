/**
 * Validation utilities for license data
 * Shared validation helpers.
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (international format)
 */
export function isValidPhone(phone: string): boolean {
  // E.164 format: +[country code][number]
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate license key format
 * Format: PRODUCT-ORG-YEAR-XXXX-XXXX-XXXX
 */
export function isValidLicenseKey(licenseKey: string): boolean {
  const licenseKeyRegex = /^[A-Z0-9]+-[A-Z]{3}-\d{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
  return licenseKeyRegex.test(licenseKey);
}

/**
 * Validate product code format
 */
export function isValidProductCode(productCode: string): boolean {
  const productCodeRegex = /^[A-Z0-9-]+$/;
  return productCodeRegex.test(productCode) && productCode.length >= 3 && productCode.length <= 20;
}

/**
 * Validate plan code format
 */
export function isValidPlanCode(planCode: string): boolean {
  const planCodeRegex = /^[A-Z0-9]+-[A-Z0-9]+-[A-Z]+$/;
  return planCodeRegex.test(planCode);
}

/**
 * Validate tier value
 */
export function isValidTier(tier: string): boolean {
  const validTiers = ['standard', 'pro', 'enterprise'];
  return validTiers.includes(tier.toLowerCase());
}

/**
 * Validate organization name
 */
export function isValidOrgName(name: string): boolean {
  return name.length >= 2 && name.length <= 100 && /^[a-zA-Z0-9\s\-&.,()]+$/.test(name);
}

/**
 * Validate features object
 */
export function isValidFeatures(features: any): boolean {
  if (typeof features !== 'object' || features === null || Array.isArray(features)) {
    return false;
  }

  return Object.values(features).every((value) => typeof value === 'boolean');
}

/**
 * Validate price amount
 */
export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && price >= 0 && !isNaN(price);
}

/**
 * Validate duration days
 */
export function isValidDuration(days: number): boolean {
  return typeof days === 'number' && days > 0 && days <= 3650 && Number.isInteger(days);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date is in future
 */
export function isFutureDate(date: Date | string): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return targetDate > new Date();
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: Date | string, endDate: Date | string): boolean {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return start < end;
}

/**
 * Validate currency code
 */
export function isValidCurrency(currency: string): boolean {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];
  return validCurrencies.includes(currency.toUpperCase());
}

/**
 * Sanitize string input (remove potentially harmful characters)
 */
export function sanitizeString(input: string, maxLength: number = 500): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // Remove non-printable characters
    .substring(0, maxLength)
    .trim();
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  return { valid: true };
}

/**
 * Validate JSON string
 */
export function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if license is expired
 */
export function isLicenseExpired(expiryDate: Date | string): boolean {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  return expiry < new Date();
}

/**
 * Calculate days until expiry
 */
export function daysUntilExpiry(expiryDate: Date | string): number {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
