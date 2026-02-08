import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type { SDKConfig, ErrorResponse } from '@universal-license/core';
import { DEFAULT_CONFIG, ERROR_CODES, HTTP_STATUS } from '@universal-license/core';
import { LicenseError, NetworkError, ValidationError, PurchaseError } from '../errors';
import { RetryStrategy } from './retry';

/**
 * HTTP Client for License Server API
 * Handles all network requests with retry logic, error handling, and interceptors
 * Internal HTTP client used by SDK modules.
 */
export class HttpClient {
  private client: AxiosInstance;
  private config: SDKConfig;
  private retry: RetryStrategy;

  constructor(config: SDKConfig) {
    this.config = config;

    // Initialize retry strategy
    this.retry = new RetryStrategy({
      maxRetries: config.retries ?? DEFAULT_CONFIG.RETRIES,
    });

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout ?? DEFAULT_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * Update the API key (JWT token) used for authenticated requests.
   * Useful after calling AuthModule.login().
   */
  setApiKey(apiKey?: string): void {
    this.config.apiKey = apiKey;
  }

  /** Get the currently configured API key (if any). */
  getApiKey(): string | undefined {
    return this.config.apiKey;
  }

  /**
   * Setup request interceptor
   * Adds authentication and logging
   */
  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      (config) => {
        // Add API key if provided
        if (this.config.apiKey) {
          config.headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        // Add Application API key for public endpoints
        if (this.config.appKey) {
          config.headers['X-ULS-App-Key'] = this.config.appKey;
        }

        // Optional application code (informational)
        if (this.config.appCode) {
          config.headers['X-ULS-App-Code'] = this.config.appCode;
        }

        // Add custom headers
        if (this.config.headers) {
          Object.entries(this.config.headers).forEach(([key, value]) => {
            config.headers[key] = value;
          });
        }

        // Debug logging
        if (this.config.debug) {
          console.log('[License SDK] Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        if (this.config.debug) {
          console.error('[License SDK] Request Error:', error);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Setup response interceptor
   * Handles errors and transforms responses
   */
  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response) => {
        // Debug logging
        if (this.config.debug) {
          console.log('[License SDK] Response:', {
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError<ErrorResponse>) => {
        // Debug logging
        if (this.config.debug) {
          console.error('[License SDK] Response Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
        }

        // Handle specific HTTP status codes
        return this.handleErrorResponse(error);
      }
    );
  }

  /**
   * Handle error responses and throw appropriate error types
   */
  private handleErrorResponse(error: AxiosError<ErrorResponse>): never {
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.error || data?.message || 'Request failed';

      // 401 Unauthorized - Invalid or expired token
      if (status === HTTP_STATUS.UNAUTHORIZED) {
        throw new ValidationError(
          errorMessage || 'Unauthorized. Please check your credentials.',
          ERROR_CODES.UNAUTHORIZED
        );
      }

      // 403 Forbidden - Insufficient permissions
      if (status === HTTP_STATUS.FORBIDDEN) {
        throw new ValidationError(errorMessage || 'Access denied.', ERROR_CODES.FORBIDDEN);
      }

      // 404 Not Found - Resource doesn't exist
      if (status === HTTP_STATUS.NOT_FOUND) {
        throw new LicenseError(errorMessage || 'Resource not found.', ERROR_CODES.INVALID_LICENSE);
      }

      // 409 Conflict - Duplicate or conflict
      if (status === HTTP_STATUS.CONFLICT) {
        throw new PurchaseError(errorMessage || 'Resource conflict.', ERROR_CODES.INVALID_PLAN);
      }

      // 429 Too Many Requests - Rate limit exceeded
      if (status === 429) {
        throw new NetworkError('Rate limit exceeded. Please try again later.', ERROR_CODES.TIMEOUT);
      }

      // 5xx Server errors
      if (status >= 500) {
        throw new NetworkError(
          errorMessage || 'Server error. Please try again later.',
          ERROR_CODES.SERVER_ERROR
        );
      }

      // 4xx Client errors
      throw new LicenseError(errorMessage, ERROR_CODES.NETWORK_ERROR);
    }

    // Network errors (no response)
    if (error.request) {
      throw new NetworkError(
        'No response from server. Please check your connection.',
        ERROR_CODES.CONNECTION_REFUSED
      );
    }

    // Request setup errors
    throw new NetworkError(error.message || 'Request failed', ERROR_CODES.NETWORK_ERROR);
  }

  /**
   * Perform GET request with retry
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.retry.execute(
      async () => {
        const response = await this.client.get<T>(url, config);
        return response.data;
      },
      (error, attempt) => {
        if (this.config.debug) {
          console.log(`[License SDK] Retrying GET ${url} (attempt ${attempt})`, error.message);
        }
      }
    );
  }

  /**
   * Perform POST request with retry
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.retry.execute(
      async () => {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
      },
      (error, attempt) => {
        if (this.config.debug) {
          console.log(`[License SDK] Retrying POST ${url} (attempt ${attempt})`, error.message);
        }
      }
    );
  }

  /**
   * Perform multipart/form-data POST (for file uploads)
   * Used by import endpoints.
   */
  async postForm<T = any>(url: string, formData: any, config?: AxiosRequestConfig): Promise<T> {
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...(config?.headers || {}),
        // Let axios set boundary when possible; this header is safe for browsers.
        'Content-Type': 'multipart/form-data',
      },
    };

    return this.retry.execute(
      async () => {
        const response = await this.client.post<T>(url, formData, mergedConfig);
        return response.data;
      },
      (error, attempt) => {
        if (this.config.debug) {
          console.log(
            `[License SDK] Retrying POST FORM ${url} (attempt ${attempt})`,
            error.message
          );
        }
      }
    );
  }

  /**
   * Perform PUT request with retry
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.retry.execute(
      async () => {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
      },
      (error, attempt) => {
        if (this.config.debug) {
          console.log(`[License SDK] Retrying PUT ${url} (attempt ${attempt})`, error.message);
        }
      }
    );
  }

  /**
   * Perform PATCH request with retry
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.retry.execute(
      async () => {
        const response = await this.client.patch<T>(url, data, config);
        return response.data;
      },
      (error, attempt) => {
        if (this.config.debug) {
          console.log(`[License SDK] Retrying PATCH ${url} (attempt ${attempt})`, error.message);
        }
      }
    );
  }

  /**
   * Perform DELETE request with retry
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.retry.execute(
      async () => {
        const response = await this.client.delete<T>(url, config);
        return response.data;
      },
      (error, attempt) => {
        if (this.config.debug) {
          console.log(`[License SDK] Retrying DELETE ${url} (attempt ${attempt})`, error.message);
        }
      }
    );
  }

  /**
   * Update SDK configuration
   */
  updateConfig(config: Partial<SDKConfig>): void {
    this.config = { ...this.config, ...config };

    // Update base URL if changed
    if (config.baseUrl && (this.client as any).defaults) {
      (this.client as any).defaults.baseURL = config.baseUrl;
    }

    // Update timeout if changed
    if (config.timeout && (this.client as any).defaults) {
      (this.client as any).defaults.timeout = config.timeout;
    }

    // Update retry strategy if retries changed
    if (config.retries !== undefined) {
      this.retry = new RetryStrategy({
        maxRetries: config.retries,
      });
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): SDKConfig {
    return { ...this.config };
  }

  /**
   * Test connection to license server
   * Calls GET /api/health endpoint
   */
  async testConnection(): Promise<{
    healthy: boolean;
    latency: number;
    version?: string;
  }> {
    const startTime = Date.now();

    try {
      const response = await this.get<{
        status: string;
        version?: string;
      }>('/health');

      const latency = Date.now() - startTime;

      return {
        healthy: response.status === 'ok',
        latency,
        version: response.version,
      };
    } catch {
      return {
        healthy: false,
        latency: Date.now() - startTime,
      };
    }
  }
}
