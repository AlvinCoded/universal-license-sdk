/**
 * Common types shared across all SDK packages
 * These mirror the types from your backend and frontend
 */

/**
 * SDK Configuration
 * Used to initialize the LicenseClient
 */
export interface SDKConfig {
  /** Base URL of your license server API */
  baseUrl: string;

  /** Optional API key for authenticated requests (admin operations) */
  apiKey?: string;

  /** Optional Application API key for public endpoints (X-ULS-App-Key) */
  appKey?: string;

  /** Optional Application code (X-ULS-App-Code). Mostly informational for v1. */
  appCode?: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;

  /** Number of retry attempts for failed requests (default: 3) */
  retries?: number;

  /** Enable/disable caching (default: true) */
  cache?: boolean;

  /** Cache TTL in milliseconds (default: 3600000 - 1 hour) */
  cacheTTL?: number;

  /** Enable debug logging (default: false) */
  debug?: boolean;

  /** Custom headers to include in all requests */
  headers?: Record<string, string>;
}

/**
 * Generic API Response wrapper
 * Matches your backend ApiResponse type
 */
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated Response
 * Used for list endpoints with pagination
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Pagination Parameters
 * Used when requesting paginated data
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Error Response
 * Matches your backend ErrorResponse type
 */
export interface ErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
  details?: any;
}

/**
 * Generic Filter Options
 */
export interface FilterOptions {
  search?: string;
  status?: string;
  tier?: string;
  productCode?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Request metadata
 * Used internally by HttpClient
 */
export interface RequestMetadata {
  url: string;
  method: string;
  timestamp: number;
  duration?: number;
  cached?: boolean;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
  shouldRetry?: (error: any) => boolean;
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Storage adapter interface
 * Allows different storage backends (localStorage, sessionStorage, memory)
 */
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}
