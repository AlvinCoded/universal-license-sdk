import { LicenseClient, DeviceFingerprint } from '@universal-license/client';

/**
 * Complete Purchase Flow Example
 * Demonstrates the full subscription purchase workflow
 *
 * Example purchase flow.
 * - backend/src/controllers/purchases.controller.ts
 * - frontend/src/hooks/usePurchases.ts
 */

async function purchaseFlow() {
  const client = new LicenseClient({
    baseUrl: 'http://localhost:3001/api',
    cache: true,
  });

  console.log('💳 Universal License SDK - Purchase Flow Example\n');

  try {
    // ====================================================================
    // STEP 1: Customer browses pricing page
    // ====================================================================
    console.log('STEP 1: Fetching subscription plans...\n');

    const productCode = 'PROD'; // Example product
    const plans = await client.products.getPlans(productCode);

    console.log('Available Plans:');
    plans.forEach((plan, index) => {
      console.log(`\n${index + 1}. ${plan.planName}`);
      console.log(`   Price: $${plan.priceAmount} ${plan.priceCurrency}`);
      console.log(`   Tier: ${plan.tier}`);
      console.log(`   Duration: ${plan.durationDays} days`);
      console.log(`   Max Users: ${plan.maxUsers || 'unlimited'}`);
      console.log('   Features:');
      Object.entries(plan.features).forEach(([feature, enabled]) => {
        if (enabled) {
          console.log(`     ✓ ${feature}`);
        }
      });
    });

    // Customer selects a plan (simulate user choice)
    const selectedPlan = plans.find((p) => p.tier === 'pro');

    if (!selectedPlan) {
      throw new Error('Pro plan not found');
    }

    console.log(`\n✓ Customer selected: ${selectedPlan.planName}\n`);

    // ====================================================================
    // STEP 2: Create purchase order
    // ====================================================================
    console.log('STEP 2: Creating purchase order...\n');

    const orderData = {
      planCode: selectedPlan.planCode,
      organizationData: {
        orgName: 'Example Organization',
        ownerName: 'Jane Doe',
        ownerEmail: 'owner@example.com',
        phone: '+1-555-123-4567',
        address: '123 Example Street, City, ST 12345',
        country: 'USA',
        region: 'State',
        orgType: 'Company',
      },
      paymentMethod: 'stripe',
      metadata: {
        source: 'website',
        campaign: 'spring-2025',
      },
    };

    const order = await client.purchases.createOrder(orderData);

    console.log('✓ Order created successfully!');
    console.log(`  Order ID: ${order.orderId}`);
    console.log(`  Amount: $${order.amount} ${order.currency}`);
    console.log(`  Plan: ${order.planName}`);
    console.log(`  Tier: ${order.tier}`);
    console.log(`  Status: ${order.paymentStatus}\n`);

    // ====================================================================
    // STEP 3: Process payment (simulated)
    // ====================================================================
    console.log('STEP 3: Processing payment...\n');

    // In real implementation, this is where you'd:
    // 1. Redirect to Stripe/PayPal
    // 2. Customer completes payment
    // 3. Payment gateway sends webhook
    // 4. Your backend calls completePurchase

    console.log('  → Customer redirected to payment gateway');
    console.log('  → Payment completed successfully');

    const paymentReference = `pi_stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`  → Payment Reference: ${paymentReference}\n`);

    // ====================================================================
    // STEP 4: Complete purchase and generate license
    // ====================================================================
    console.log('STEP 4: Completing purchase and generating license...\n');

    const purchase = await client.purchases.completePurchase({
      orderId: order.orderId,
      paymentReference,
    });

    console.log('✓ Purchase completed successfully!');
    console.log('\n📄 License Details:');
    console.log(`  License Key: ${purchase.license.licenseKey}`);
    console.log(`  Organization: ${purchase.organization.orgName}`);
    console.log(`  Tier: ${purchase.license.tier}`);
    console.log(`  Status: ${purchase.license.status}`);
    console.log(`  Issued: ${new Date(purchase.license.issuedAt).toLocaleDateString()}`);
    console.log(`  Expires: ${new Date(purchase.license.expiresAt).toLocaleDateString()}`);
    console.log(`  Max Users: ${purchase.license.maxUsers || 'unlimited'}`);

    console.log('\n  Features:');
    Object.entries(purchase.license.features).forEach(([feature, enabled]) => {
      console.log(`    ${enabled ? '✓' : '✗'} ${feature}`);
    });

    // ====================================================================
    // STEP 5: Validate the new license
    // ====================================================================
    console.log('\n\nSTEP 5: Validating new license...\n');

    const deviceId = await DeviceFingerprint.generate();
    const validation = await client.validation.validate({
      licenseKey: purchase.license.licenseKey,
      deviceId,
    });

    if (validation.valid) {
      console.log('✓ License validated successfully!');
      console.log('  Customer can now access the application.\n');
    } else {
      console.error('✗ License validation failed:', validation.error);
    }

    // ====================================================================
    // STEP 6: Email license to customer (info only)
    // ====================================================================
    console.log('STEP 6: Sending license email...\n');
    console.log(`  → Email sent to: ${orderData.organizationData.ownerEmail}`);
    console.log('  → Subject: Your Holy Resource License Key');
    console.log(`  → License Key: ${purchase.license.licenseKey}`);
    console.log('  → Includes: Activation instructions and support links\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Purchase flow completed successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');

    return purchase;
  } catch (error: any) {
    console.error('\n❌ Purchase flow failed:', error.message);
    throw error;
  }
}

// Run the purchase flow example
purchaseFlow().catch((error) => {
  console.error('Example failed:', error);
  process.exit(1);
});
