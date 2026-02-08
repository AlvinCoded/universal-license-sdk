/**
 * Auth types
 * Auth-related API types.
 */

export interface AuthUser {
  id: number;
  username: string;
  email?: string | null;
  role: string;
  last_login_at?: string | null;
  created_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface VerifyResponse {
  valid: boolean;
  user: AuthUser;
}

export interface UpdateProfileRequest {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
}
