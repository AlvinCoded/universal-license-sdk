/**
 * Health/status types
 * Health-related API types.
 */

export interface DatabaseStatus {
  mode?: string;
  database?: string;
  usingFallback?: boolean;
  [key: string]: any;
}

export interface HealthResponse {
  status: 'ok' | string;
  timestamp: string;
  version: string;
  environment: string;
  database: DatabaseStatus;
}

export interface DatabaseHealthResponse {
  status: 'healthy' | 'unhealthy' | string;
  isOnline?: boolean;
  lastCheck?: string;
  latencyMs?: number;
  consecutiveFailures?: number;
  uptime?: number;
  memoryUsage?: any;
  error?: string;
  [key: string]: any;
}

export interface EmailStatusResponse {
  configured: boolean;
  provider: string;
  fromEmail: string;
  tokenSet: boolean;
}
