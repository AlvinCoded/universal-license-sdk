/**
 * Activity/audit log types
 * Activity/audit-log API types.
 */

export interface ActivityLog {
  id: number;
  user_id?: number | null;
  username?: string | null;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  details?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface GetActivityLogsResponse {
  logs: ActivityLog[];
}

export interface GetValidationLogsResponse {
  logs: import('./license.types').ValidationLog[];
}
