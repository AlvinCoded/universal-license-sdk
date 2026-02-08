/**
 * Next.js Integration Example
 * Shows how to use the SDK in Next.js App Router
 *
 * This matches your frontend architecture using Next.js
 */

'use client';

import { useEffect, useState } from 'react';
import { LicenseClient, DeviceFingerprint } from '@unilic/client';
import type { License } from '@unilic/client';

// Initialize client (can also be in a context provider)
const client = new LicenseClient({
  baseUrl: process.env.NEXT_PUBLIC_LICENSE_API_URL!,
  cache: true,
});

/**
 * Server Component - Pricing Page
 * Fetches plans on the server for SEO
 */
export async function PricingPage() {
  // In Next.js App Router, this runs on the server
  const products = await client.products.getAll();
  const plans = await client.products.getPlans('PROD');

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PricingCard key={plan.planCode} plan={plan} />
        ))}
      </div>
    </div>
  );
}

/**
 * Client Component - Pricing Card with Purchase
 */
function PricingCard({ plan }: { plan: any }) {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    setIsPurchasing(true);

    try {
      // Create order
      const order = await client.purchases.createOrder({
        planCode: plan.planCode,
        organizationData: {
          orgName: 'Example Organization',
          ownerName: 'John Doe',
          ownerEmail: 'john@example.com',
          country: 'USA',
        },
      });

      // Redirect to payment
      // In production, redirect to Stripe/PayPal with order.orderId
      console.log('Order created:', order.orderId);

      // For this example, simulate payment completion
      window.location.href = `/checkout/${order.orderId}`;
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 shadow-lg">
      <h3 className="text-2xl font-bold mb-2">{plan.planName}</h3>
      <p className="text-3xl font-bold text-blue-600 mb-4">
        ${plan.priceAmount}
        <span className="text-lg text-gray-600">/{plan.durationDays}d</span>
      </p>

      <ul className="space-y-2 mb-6">
        {Object.entries(plan.features).map(
          ([feature, enabled]) =>
            enabled && (
              <li key={feature} className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>{feature}</span>
              </li>
            )
        )}
      </ul>

      <button
        onClick={handlePurchase}
        disabled={isPurchasing}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isPurchasing ? 'Processing...' : 'Subscribe Now'}
      </button>
    </div>
  );
}

/**
 * Checkout Success Page
 * Handles payment completion
 */
export function CheckoutSuccessPage({ orderId }: { orderId: string }) {
  const [purchase, setPurchase] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function completePurchase() {
      try {
        // Get payment reference from URL params (from Stripe redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const paymentReference = urlParams.get('payment_intent');

        if (!paymentReference) {
          throw new Error('Payment reference not found');
        }

        // Complete the purchase
        const result = await client.purchases.completePurchase({
          orderId,
          paymentReference,
        });

        setPurchase(result);

        // Store license key
        localStorage.setItem('licenseKey', result.license.licenseKey);
      } catch (error) {
        console.error('Failed to complete purchase:', error);
      } finally {
        setIsLoading(false);
      }
    }

    completePurchase();
  }, [orderId]);

  if (isLoading) {
    return <div>Processing your purchase...</div>;
  }

  if (!purchase) {
    return <div>Failed to complete purchase. Please contact support.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-6">
        <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 Purchase Successful!</h2>
        <p className="text-green-700">Your license has been generated and sent to your email.</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Your License Details</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">License Key</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={purchase.license.licenseKey}
                readOnly
                className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(purchase.license.licenseKey);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Organization</label>
              <p className="font-semibold">{purchase.organization.orgName}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600">Tier</label>
              <p className="font-semibold capitalize">{purchase.license.tier}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600">Expires</label>
              <p className="font-semibold">
                {new Date(purchase.license.expiresAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-600">Max Users</label>
              <p className="font-semibold">{purchase.license.maxUsers || 'Unlimited'}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <h4 className="font-bold mb-2">Next Steps:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Download and install your application</li>
            <li>Enter your license key during setup</li>
            <li>Start using all the features included in your plan</li>
          </ol>
        </div>

        <button
          onClick={() => (window.location.href = '/dashboard')}
          className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

/**
 * Protected Route Example
 * Middleware to check license validity
 */
export async function requireLicense() {
  const licenseKey = localStorage.getItem('licenseKey');

  if (!licenseKey) {
    // Redirect to onboarding
    window.location.href = '/onboarding';
    return false;
  }

  // Validate license
  const deviceId = await DeviceFingerprint.generate();
  const validation = await client.validation.validate({
    licenseKey,
    deviceId,
  });

  if (!validation.valid) {
    // License invalid - redirect to renewal
    window.location.href = '/renew';
    return false;
  }

  return true;
}
