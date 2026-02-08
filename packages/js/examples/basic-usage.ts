import { LicenseClient, DeviceFingerprint } from '@unilic/client';

/**
 * Basic Usage Example
 * Demonstrates core SDK functionality for license validation
 *
 * Basic SDK usage example.
 */

async function main() {
  // 1. Initialize the client
  const client = new LicenseClient({
    baseUrl: 'http://localhost:3001/api',
    cache: true,
    debug: true,
  });

  console.log('🔐 Universal License SDK - Basic Usage Example\n');

  // 2. Test server connection
  console.log('Testing connection...');
  const health = await client.testConnection();

  if (health.healthy) {
    console.log(`✓ Server is healthy (latency: ${health.latency}ms)`);
    console.log(`  Version: ${health.version || 'unknown'}\n`);
  } else {
    console.error('✗ Server is not responding\n');
    process.exit(1);
  }

  // 3. Get available products and plans
  console.log('📦 Fetching products...');
  const products = await client.products.getAll();

  console.log(`Found ${products.length} products:\n`);

  for (const product of products) {
    console.log(`  • ${product.productName} (${product.productCode})`);

    const plans = await client.products.getPlans(product.productCode);
    plans.forEach((plan) => {
      console.log(
        `    - ${plan.planName}: $${plan.priceAmount} ${plan.priceCurrency} (${plan.tier} tier)`
      );
      console.log(
        `      Duration: ${plan.durationDays} days | Max Users: ${plan.maxUsers || 'unlimited'}`
      );
    });
    console.log('');
  }

  // 4. Validate an existing license (simulation)
  // In real usage, this license key would come from user input
  const testLicenseKey = 'PROD-ORG-2025-XXXX-XXXX-XXXX'; // Example key

  console.log('🔐 Validating license...');
  console.log(`License Key: ${testLicenseKey}`);

  try {
    const deviceId = await DeviceFingerprint.generate();
    console.log(`Device ID: ${deviceId.substring(0, 16)}...\n`);

    const validation = await client.validation.validate({
      licenseKey: testLicenseKey,
      deviceId,
      requiredTier: 'standard',
      requiredFeatures: ['memberManagement', 'attendance'],
    });

    if (validation.valid) {
      console.log('✓ License is VALID!\n');
      console.log('License Details:');
      console.log(`  Organization: ${validation.license?.orgName}`);
      console.log(`  Product: ${validation.license?.productCode}`);
      console.log(`  Tier: ${validation.license?.tier}`);
      console.log(`  Status: ${validation.license?.status}`);
      console.log(`  Max Users: ${validation.license?.maxUsers || 'unlimited'}`);
      console.log(
        `  Expires: ${new Date(validation.license?.expiresAt || '').toLocaleDateString()}`
      );
      console.log('\nAvailable Features:');
      Object.entries(validation.license?.features || {}).forEach(([feature, enabled]) => {
        console.log(`  ${enabled ? '✓' : '✗'} ${feature}`);
      });
    } else {
      console.log('✗ License validation FAILED');
      console.log(`  Reason: ${validation.error}`);

      if (validation.currentTier && validation.requiredTier) {
        console.log(`  Current tier: ${validation.currentTier}`);
        console.log(`  Required tier: ${validation.requiredTier}`);
      }

      if (validation.missingFeatures && validation.missingFeatures.length > 0) {
        console.log(`  Missing features: ${validation.missingFeatures.join(', ')}`);
      }
    }
  } catch (error: any) {
    console.error('✗ Validation error:', error.message);
  }

  console.log('\n✅ Example completed!');
}

// Run the example
main().catch((error) => {
  console.error('Example failed:', error);
  process.exit(1);
});
