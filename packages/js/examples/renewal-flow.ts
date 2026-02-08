/**
 * License Renewal Example
 * Demonstrates renewal workflows including magic links
 *
 * This matches your renewal system:
 * - backend/src/routes/renewal.routes.ts
 * - backend/src/services/notification.scheduler.ts
 */

import { LicenseClient, DeviceFingerprint } from '@unilic/client';

async function renewalFlow() {
  const client = new LicenseClient({
    baseUrl: 'http://localhost:3001/api',
    cache: true,
  });

  console.log('🔄 Universal License SDK - Renewal Flow Example\n');

  const licenseKey = 'PROD-ORG-2025-XXXX-XXXX-XXXX'; // Example license

  try {
    // ====================================================================
    // 1. Check Days Until Expiry
    // ====================================================================
    console.log('1. Checking license expiry...\n');

    const daysLeft = await client.licenses.getDaysUntilExpiry(licenseKey);

    console.log(`License expires in ${daysLeft} days`);

    if (daysLeft < 30) {
      console.log('⚠️  Renewal recommended!\n');
    }

    // ====================================================================
    // 2. Request Renewal Magic Link (Email)
    // ====================================================================
    console.log('2. Requesting renewal magic link...\n');

    const magicLinkResult = await client.renewals.requestMagicLink({
      licenseKey,
      email: 'owner@example.com',
    });

    console.log('✓ Magic link sent successfully!');
    console.log(`  Message: ${magicLinkResult.message}`);
    console.log('  Customer will receive an email with renewal link\n');

    // ====================================================================
    // 3. Customer Clicks Magic Link (Simulated)
    // ====================================================================
    console.log('3. Processing renewal via magic link...\n');

    // In real usage, this token comes from the email link
    const mockToken = 'renewal_token_from_email_link';

    console.log('  → Customer clicks renewal link in email');
    console.log('  → Redirected to payment gateway');
    console.log('  → Payment completed\n');

    // ====================================================================
    // 4. Complete Renewal After Payment
    // ====================================================================
    console.log('4. Completing renewal...\n');

    const paymentReference = `renewal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const renewalResult = await client.renewals.renew({
      licenseKey,
      durationDays: 365, // Renew for 1 year
      paymentReference,
    });

    console.log('✓ License renewed successfully!');
    console.log(`  New Expiry Date: ${new Date(renewalResult.newExpiry).toLocaleDateString()}`);
    console.log(`  Message: ${renewalResult.message}\n`);

    // ====================================================================
    // 5. Verify Renewed License
    // ====================================================================
    console.log('5. Verifying renewed license...\n');

    const deviceId = await DeviceFingerprint.generate();
    const validation = await client.validation.validate({
      licenseKey,
      deviceId,
    });

    if (validation.valid) {
      console.log('✓ License is valid!');
      console.log(
        `  New expiry: ${new Date(validation.license?.expiresAt || '').toLocaleDateString()}`
      );

      const newDaysLeft = await client.licenses.getDaysUntilExpiry(licenseKey);
      console.log(`  Days until next renewal: ${newDaysLeft}\n`);
    }

    // ====================================================================
    // 6. Admin View: Renewal History
    // ====================================================================
    console.log('6. Viewing renewal history (admin)...\n');

    // Note: This requires admin authentication
    // const history = await client.licenses.getRenewalHistory(licenseKey);
    // history.forEach((renewal, index) => {
    //   console.log(`  ${index + 1}. ${new Date(renewal.renewed_at).toLocaleDateString()}`);
    //   console.log(`     Extended by: ${renewal.days_extended} days`);
    //   console.log(`     Payment: ${renewal.payment_reference}`);
    // });

    console.log('  (Requires admin authentication)\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Renewal flow completed successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');
  } catch (error: any) {
    console.error('\n❌ Renewal flow failed:', error.message);
    throw error;
  }
}

// Run the renewal flow example
renewalFlow().catch((error) => {
  console.error('Example failed:', error);
  process.exit(1);
});
