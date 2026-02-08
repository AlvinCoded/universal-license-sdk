import type { HttpClient } from '../http/HttpClient';
import type {
  LoginRequest,
  LoginResponse,
  VerifyResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '@unilic/core';

/**
 * Auth operations
 * Authentication endpoints.
 */
export class AuthModule {
  constructor(private http: HttpClient) {}

  /** POST /api/auth/login */
  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.http.post<LoginResponse>('/auth/login', request);
  }

  /** GET /api/auth/verify (requires Authorization: Bearer <token>) */
  async verify(): Promise<VerifyResponse> {
    return this.http.get<VerifyResponse>('/auth/verify');
  }

  /** PATCH /api/auth/profile (requires Authorization) */
  async updateProfile(request: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    return this.http.patch<UpdateProfileResponse>('/auth/profile', request);
  }
}
