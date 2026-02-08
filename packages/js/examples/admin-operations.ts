/**
 * Admin Operations Example
 * Demonstrates administrative tasks like license generation and management
 *
 * Example admin operations.
 * - backend/src/controllers/licenses.controller.ts
 * - frontend/src/app/(dashboard)/licenses/page.tsx
 */

import { LicenseClient } from '@universal-license/client';

async function adminOperations() {
  // Initialize with admin authentication
  const client = new LicenseClient({
    baseUrl: 'http://localhost:3001/api',
    apiKey: 'your-admin-jwt-token', // From /api/auth/login
    debug: true,
  });

  console.log('🔐 Universal License SDK - Admin Operations Example\n');

  try {
    // ====================================================================
    // 1. Get Dashboard Statistics
    // ====================================================================
    console.log('1. Fetching dashboard statistics...\n');

    const stats = await client.licenses.getStats();

    console.log('License Statistics:');
    console.log(`  Total: ${stats.total}`);
    console.log(`  Active: ${stats.active}`);
    console.log(`  Pending: ${stats.pending}`);
    console.log(`  Expired: ${stats.expired}`);
    console.log(`  Revoked: ${stats.revoked}`);
    console.log(`\nRevenue:`);
    console.log(`  Total: $${stats.revenue.total.toLocaleString()}`);
    console.log(`  This Month: $${stats.revenue.thisMonth.toLocaleString()}`);
    console.log(`\nTier Distribution:`);
    Object.entries(stats.tierDistribution).forEach(([tier, count]) => {
      console.log(`  ${tier}: ${count}`);
    });

    // ====================================================================
    // 2. Get All Licenses with Filters
    // ====================================================================
    console.log('\n\n2. Fetching licenses with filters...\n');

    const licenses = await client.licenses.getAll({
      tier: 'pro',
      status: 'active',
      productCode: 'PROD',
    });

    console.log(`Found ${licenses.length} pro-tier active licenses for PROD:`);
    licenses.slice(0, 3).forEach((license) => {
      console.log(`  • ${license.license_key}`);
      console.log(`    Organization: ${license.org_name}`);
      console.log(`    Expires: ${new Date(license.expires_at).toLocaleDateString()}`);
    });

    // ====================================================================
    // 3. Generate a License Manually
    // ====================================================================
    console.log('\n\n3. Generating new license...\n');

    const generationResult = await client.licenses.generate({
      planCode: 'PROD-PRO-ANNUAL',
      organizationData: {
        orgName: 'Example Organization',
        ownerName: 'Jane Doe',
        ownerEmail: 'owner@example.com',
        phone: '+1-555-987-6543',
        orgType: 'Company',
        country: 'USA',
      },
      durationDays: 365,
      renewalSettings: {
        autoRenew: false,
        renewalReminderDays: 30,
      },
    });

    console.log('✓ License generated successfully!');
    console.log(`  License Key: ${generationResult.license.licenseKey}`);
    console.log(`  Organization: ${generationResult.organization.orgName}`);
    console.log(`  Organization Code: ${generationResult.organization.orgCode}`);

    // ====================================================================
    // 4. Get License Details
    // ====================================================================
    console.log('\n\n4. Fetching license details...\n');

    const license = await client.licenses.get(generationResult.license.licenseKey);

    console.log('License Details:');
    console.log(`  Key: ${license.license_key}`);
    console.log(`  Organization: ${license.org_name}`);
    console.log(`  Product: ${license.product_code}`);
    console.log(`  Tier: ${license.tier}`);
    console.log(`  Status: ${license.status}`);
    console.log(`  Max Users: ${license.max_users || 'unlimited'}`);
    console.log(`  Issued: ${new Date(license.issued_at).toLocaleDateString()}`);
    console.log(`  Expires: ${new Date(license.expires_at).toLocaleDateString()}`);

    if (license.device_id_hash) {
      console.log(`  Device Bound: Yes`);
    }

    // ====================================================================
    // 5. Check Upcoming Renewals
    // ====================================================================
    console.log('\n\n5. Checking upcoming renewals (next 90 days)...\n');

    const renewals = await client.licenses.getUpcomingRenewals(90);

    console.log(`Found ${renewals.length} licenses expiring in the next 90 days:`);
    renewals.slice(0, 5).forEach((lic) => {
      const daysLeft = Math.ceil(
        (new Date(lic.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      console.log(`  • ${lic.license_key}`);
      console.log(`    Organization: ${lic.org_name}`);
      console.log(`    Days until expiry: ${daysLeft}`);
      console.log(`    Auto-renew: ${lic.auto_renew ? 'Yes' : 'No'}`);
    });

    // ====================================================================
    // 6. Revoke a License
    // ====================================================================
    console.log('\n\n6. Revoking a license (example)...\n');

    // Note: In production, be careful with this operation!
    // const revokeResult = await client.licenses.revoke(
    //   'SOME-LICENSE-KEY',
    //   'Payment failure'
    // );
    // console.log('✓ License revoked successfully');

    console.log('  (Skipped in example to avoid revoking real licenses)');

    // ====================================================================
    // 7. Search Licenses
    // ====================================================================
    console.log('\n\n7. Searching licenses...\n');

    const searchResults = await client.licenses.getAll({
      search: 'Example',
    });

    console.log(`Found ${searchResults.length} licenses matching "Example":`);
    searchResults.slice(0, 3).forEach((lic) => {
      console.log(`  • ${lic.org_name} - ${lic.license_key}`);
    });

    console.log('\n✅ Admin operations completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Admin operations failed:', error.message);
    throw error;
  }
}

// Run the admin operations example
adminOperations().catch((error) => {
  console.error('Example failed:', error);
  process.exit(1);
});
