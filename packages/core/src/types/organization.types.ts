/**
 * Organization types
 * Matches your backend organizations table
 */

/**
 * Organization Entity
 */
export interface Organization {
  id: number;
  org_code: string;
  org_name: string;
  org_type?: string;
  owner_name: string;
  owner_email?: string;
  address?: string;
  phone?: string;
  email?: string;
  country?: string;
  region?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;

  // Computed fields
  active_licenses?: number;
  total_licenses?: number;
}

/**
 * Create Organization Request
 */
export interface CreateOrganizationRequest {
  orgName: string;
  orgType?: string;
  ownerName: string;
  ownerEmail?: string;
  address?: string;
  phone?: string;
  email?: string;
  country?: string;
  region?: string;
  metadata?: Record<string, any>;
}

/**
 * Update Organization Request
 */
export interface UpdateOrganizationRequest {
  orgName?: string;
  orgType?: string;
  ownerName?: string;
  ownerEmail?: string;
  address?: string;
  phone?: string;
  email?: string;
  country?: string;
  region?: string;
  metadata?: Record<string, any>;
}

/**
 * Organization details endpoint response
 * Organization-related API types.
 */
export interface OrganizationWithLicensesResponse {
  organization: Organization;
  licenses: import('./license.types').License[];
  licenseCount: number;
}
