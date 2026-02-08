import type { HttpClient } from '../http/HttpClient';
import { API_ENDPOINTS } from '@unilic/core';
import type {
  LicenseOwnershipStatusResponse,
  ClaimLicenseOwnerRequest,
  ClaimLicenseOwnerResponse,
  CreateLicenseInviteRequest,
  CreateLicenseInviteResponse,
  RedeemLicenseInviteRequest,
  RedeemLicenseInviteResponse,
} from '@unilic/core';

/**
 * Ownership & invite operations for app onboarding.
 *
 * These endpoints are public-but-app-scoped (require X-ULS-App-Key), except invite creation
 * which requires an owner token (returned from claimOwner).
 */
export class OwnershipModule {
  constructor(private http: HttpClient) {}

  /**
   * Check whether a license has been claimed by an app-side owner.
   * GET /api/licenses/:licenseKey/ownership
   */
  async getStatus(licenseKey: string): Promise<LicenseOwnershipStatusResponse> {
    return this.http.get<LicenseOwnershipStatusResponse>(
      API_ENDPOINTS.LICENSES.OWNERSHIP(licenseKey)
    );
  }

  /**
   * Claim a license owner (first-claim wins).
   * POST /api/licenses/:licenseKey/claim-owner
   */
  async claimOwner(
    licenseKey: string,
    request: ClaimLicenseOwnerRequest
  ): Promise<ClaimLicenseOwnerResponse> {
    return this.http.post<ClaimLicenseOwnerResponse>(
      API_ENDPOINTS.LICENSES.CLAIM_OWNER(licenseKey),
      request
    );
  }

  /**
   * Create a server-managed invite code (owner token required).
   * POST /api/licenses/:licenseKey/invites
   */
  async createInvite(
    licenseKey: string,
    request?: CreateLicenseInviteRequest
  ): Promise<CreateLicenseInviteResponse> {
    return this.http.post<CreateLicenseInviteResponse>(
      API_ENDPOINTS.LICENSES.INVITES_CREATE(licenseKey),
      request ?? {}
    );
  }

  /**
   * Redeem an invite code (returns a short-lived grant token).
   * POST /api/licenses/:licenseKey/invites/redeem
   */
  async redeemInvite(
    licenseKey: string,
    request: RedeemLicenseInviteRequest
  ): Promise<RedeemLicenseInviteResponse> {
    return this.http.post<RedeemLicenseInviteResponse>(
      API_ENDPOINTS.LICENSES.INVITES_REDEEM(licenseKey),
      request
    );
  }
}
