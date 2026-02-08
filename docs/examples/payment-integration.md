# Payment Integration Example

Implement a complete purchase and payment flow using the SDK.

## Overview

This example demonstrates:

- Fetching available plans with `client.products.getPlans()` (or similar)
- Creating purchase orders with `client.purchases.createOrder()`
- Creating payments with `client.payments.createPayment()`
- Integrating with payment providers (Stripe, Paystack)
- Completing purchases server-side with `client.purchases.completePurchase()`
- Handling payment confirmations and errors

Note: some servers enable additional anti-abuse protections on purchase/payment endpoints (rate
limits, daily quotas, optional CAPTCHA). If CAPTCHA is required, send a token via the
`x-uls-captcha-token` header (or `captchaToken` in the JSON body if supported by your integration).

## Complete Implementation

```typescript
import { LicenseClient } from '@universal-license/client';
import { loadStripe, type Stripe, type StripeCardElement } from '@stripe/stripe-js';

const client = new LicenseClient({
  baseUrl: 'https://license-server.example.com/api',
  // Required for public endpoints (multi-application)
  appKey: 'YOUR_APP_KEY',
});

const stripePromise = loadStripe('pk_test_YOUR_STRIPE_KEY');

/**
 * Step 1: Load available plans
 */
async function loadAvailablePlans(productCode: string) {
  try {
    // Public endpoint: plans users can purchase for a product
    return await client.products.getPlans(productCode);
  } catch (error) {
    console.error('Failed to load plans:', error);
    throw error;
  }
}

/**
 * Step 2: Create a purchase order
 */
async function createPurchaseOrder(planCode, organizationData) {
  try {
    console.log('Creating purchase order for plan:', planCode);

    // Use a stable idempotency key for safe retries (UUID recommended)
    const idempotencyKey = `create_order_${
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? (crypto as any).randomUUID()
        : `${Date.now()}_${Math.random().toString(16).slice(2)}`
    }`;

    const { order } = await client.purchases.createOrder(
      {
        planCode,
        organizationData: {
          orgName: organizationData.companyName,
          ownerName: organizationData.fullName,
          ownerEmail: organizationData.email,
        },
      },
      { idempotencyKey }
    );

    console.log('Order created:', {
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
    });

    return order; // { orderId, amount, currency, planName, tier, status }
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
}

/**
 * Step 3: Create a gateway payment
 */
async function createPayment(options: {
  orderId: string;
  amount: number;
  currency: string;
  organizationId: number;
  planCode: string;
  email: string;
  gateway: 'stripe' | 'paystack';
  callbackUrl?: string;
}) {
  return client.payments.createPayment(
    {
      gateway: options.gateway,
      orderId: options.orderId,
      amount: options.amount,
      currency: options.currency,
      organizationId: options.organizationId,
      planCode: options.planCode,
      email: options.email,
      callbackUrl: options.callbackUrl,
    },
    { idempotencyKey: `create_payment_${options.orderId}` }
  );
}

/**
 * Step 4: Process payment with Stripe
 */
async function processStripePayment(options: {
  payment: { gateway: 'stripe'; type: 'payment_intent'; clientSecret: string | null };
  cardElement: StripeCardElement;
  billingDetails: { name: string; email: string };
}) {
  try {
    const stripe: Stripe | null = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to initialize');

    if (!options.payment.clientSecret) {
      throw new Error('Stripe clientSecret is missing');
    }

    // Use clientSecret returned by createPayment
    const result = await stripe.confirmCardPayment(options.payment.clientSecret, {
      payment_method: {
        card: options.cardElement,
        billing_details: {
          name: options.billingDetails.name,
          email: options.billingDetails.email,
        },
      },
    });

    if (result.error) {
      console.error('Payment failed:', result.error.message);
      return { success: false, error: result.error.message };
    }

    if (result.paymentIntent?.status === 'succeeded') {
      console.log('Payment succeeded:', result.paymentIntent.id);
      return {
        success: true,
        paymentId: result.paymentIntent.id,
      };
    }
  } catch (error) {
    console.error('Stripe error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Step 4b: Process payment with Paystack (redirect)
 */
function processPaystackPayment(payment: {
  gateway: 'paystack';
  type: 'redirect';
  authorizationUrl: string;
  reference: string;
}) {
  window.location.href = payment.authorizationUrl;
  return { success: true, paymentId: payment.reference };
}

/**
 * Step 4: Complete the purchase (server-side after webhook verification)
 */
async function completePurchase(orderId, paymentReference) {
  try {
    console.log('Completing purchase:', { orderId, paymentReference });

    // Use a stable idempotency key for safe retries of completion
    const idempotencyKey = `complete_purchase_${orderId}`;

    const result = await client.purchases.completePurchase(
      {
        orderId,
        paymentReference, // Stripe payment intent ID
      },
      { idempotencyKey }
    );

    if (result.license) {
      console.log('✓ Purchase complete! License:', result.license.licenseKey);
      return { success: true, license: result.license };
    } else {
      throw new Error('No license in response');
    }
  } catch (error) {
    console.error('Failed to complete purchase:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Full purchase flow
 * organizationData should include: companyName, fullName, email, organizationId,
 * gateway ('stripe' | 'paystack'), and for Stripe: cardElement.
 */
async function handlePurchaseFlow(planCode, organizationData) {
  try {
    // Step 1: Create order
    console.log('Step 1: Creating order');
    const order = await createPurchaseOrder(planCode, organizationData);

    // Step 2: Create payment
    console.log('Step 2: Creating payment');
    const payment = await createPayment({
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      organizationId: organizationData.organizationId,
      planCode,
      email: organizationData.email,
      gateway: organizationData.gateway,
    });

    // Step 3: Process payment
    console.log('Step 3: Processing payment');
    const paymentResult =
      payment.gateway === 'stripe'
        ? await processStripePayment({
            payment,
            cardElement: organizationData.cardElement,
            billingDetails: {
              name: organizationData.fullName,
              email: organizationData.email,
            },
          })
        : processPaystackPayment(payment);

    if (!paymentResult.success) {
      throw new Error(paymentResult.error);
    }

    // Step 4: Complete purchase (server-side after webhook verification)
    console.log('Step 4: Awaiting server confirmation');
    return { success: true };
  } catch (error) {
    console.error('Purchase flow failed:', error);
    throw error;
  }
}
```

## React Payment Form Component

**Runnable example:** Minimal, runnable server + frontend example is available at
`examples/stripe-minimal/` (see `examples/stripe-minimal/README.md`) — it demonstrates creating an
order, confirming payment with Stripe Elements, and completing the purchase via a server webhook.

```jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { LicenseClient } from '@universal-license/client';

const stripePromise = loadStripe('pk_test_YOUR_STRIPE_KEY');
const client = new LicenseClient({
  baseUrl: 'https://license-server.example.com/api',
});

const PaymentForm = ({ planCode, organizationId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: Get payment details from form
      const email = document.getElementById('email').value;
      const companyName = document.getElementById('company').value;
      const fullName = document.getElementById('name').value;

      // Step 2: Create purchase order
      const { order } = await client.purchases.createOrder({
        planCode,
        organizationData: {
          orgName: companyName,
          ownerName: fullName,
          ownerEmail: email,
        },
      });

      console.log('Order created:', order.orderId);

      // Step 3: Create payment (Stripe)
      const payment = await client.payments.createPayment({
        gateway: 'stripe',
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        organizationId,
        planCode,
        email,
      });

      if (payment.gateway !== 'stripe' || payment.type !== 'payment_intent') {
        setError('Unexpected payment response');
        setLoading(false);
        return;
      }

      // Step 4: Confirm payment with Stripe
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
        payment.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { name: fullName, email },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status !== 'succeeded') {
        setError('Payment was not successful');
        setLoading(false);
        return;
      }

      // Step 5: Complete purchase with SDK (server-side after webhook verification)
      // In production, call this from your server after receiving the gateway webhook.
      const result = await client.purchases.completePurchase({
        orderId: order.orderId,
        paymentReference: paymentIntent.id,
      });

      if (result.license) {
        // Store and callback
        localStorage.setItem('licenseKey', result.license.licenseKey);
        onSuccess(result.license);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Complete Your Purchase</h2>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-4">{error}</div>}

      <div className="mb-4">
        <label className="block font-semibold mb-2">Full Name</label>
        <input
          id="name"
          type="text"
          placeholder="John Doe"
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Email</label>
        <input
          id="email"
          type="email"
          placeholder="john@example.com"
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Company Name</label>
        <input
          id="company"
          type="text"
          placeholder="Acme Corp"
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-2">Card Details</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Complete Purchase'}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [license, setLicense] = useState(null);

  return (
    <div>
      {purchaseComplete ? (
        <div className="bg-green-50 text-green-700 p-6 rounded text-center">
          <h2 className="text-2xl font-bold mb-4">✓ Purchase Complete!</h2>
          <p className="mb-4">Your license is ready to use.</p>
          <p className="font-mono text-sm mb-4">{license?.licenseKey}</p>
          <a href="/app" className="bg-green-600 text-white px-6 py-3 rounded inline-block">
            Go to App
          </a>
        </div>
      ) : (
        <Elements stripe={stripePromise}>
          <PaymentForm
            planCode="STARTER-MONTHLY"
            organizationId={123}
            onSuccess={(lic) => {
              setLicense(lic);
              setPurchaseComplete(true);
            }}
          />
        </Elements>
      )}
    </div>
  );
};

export default PaymentPage;
```

## Payment Provider Integration

### Stripe Integration

```typescript
// Install: npm install @stripe/stripe-js

import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe('pk_test_YOUR_KEY');

const payment = await client.payments.createPayment({
  gateway: 'stripe',
  orderId: order.orderId,
  amount: order.amount,
  currency: order.currency,
  organizationId: 123,
  planCode: 'STARTER-MONTHLY',
  email: 'buyer@example.com',
});

const result = await stripe.confirmCardPayment(payment.clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name, email },
  },
});

if (result.paymentIntent.status === 'succeeded') {
  // Payment successful, use result.paymentIntent.id
  // Complete purchase server-side after webhook verification
}
```

### Paystack Integration

```typescript
const payment = await client.payments.createPayment({
  gateway: 'paystack',
  orderId: order.orderId,
  amount: order.amount,
  currency: order.currency,
  organizationId: 123,
  planCode: 'STARTER-MONTHLY',
  email: 'buyer@example.com',
  callbackUrl: 'https://your-app.com/payments/paystack/callback',
});

if (payment.gateway === 'paystack' && payment.type === 'redirect') {
  window.location.href = payment.authorizationUrl;
}
```

## Error Handling

```typescript
async function handlePaymentError(error) {
  console.error('Payment error:', error);

  // Different error types
  if (error.code === 'card_declined') {
    showMessage('Card was declined. Please try another payment method.');
  } else if (error.code === 'lost_card') {
    showMessage('Card was lost or stolen. Please use another card.');
  } else if (error.code === 'expired_card') {
    showMessage('Card has expired. Please use another card.');
  } else if (error.code === 'incorrect_cvc') {
    showMessage('Incorrect CVC. Please check and try again.');
  } else if (error.type === 'validation_error') {
    showMessage('Please fill in all required fields correctly.');
  } else {
    showMessage(`Payment failed: ${error.message}`);
  }
}
```

## Handling Purchase Confirmation Webhooks

```typescript
// Server webhook handler for payment confirmations
// This is called by Stripe when payment completes

express.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle payment intent succeeded
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    // Find the order and license information
    // Then call client.purchases.completePurchase()
    const result = await client.purchases.completePurchase({
      orderId: paymentIntent.metadata.orderId,
      paymentReference: paymentIntent.id,
    });

    console.log('License generated:', result.license.licenseKey);

    // Send email to customer with license
    sendLicenseEmail(paymentIntent.receipt_email, result.license);
  }

  res.json({ received: true });
});
```

For Paystack, verify `x-paystack-signature` (HMAC SHA-512 of the raw payload), then confirm the
transaction via the Paystack API before calling `client.purchases.completePurchase()` on your
server.

## Order Object Structure

```typescript
interface CreateOrderResponse {
  order: {
    orderId: string; // Unique order identifier
    amount: number; // Price in major units (e.g., 29.99)
    currency: string; // e.g., 'USD'
    planName: string; // Display name
    tier: string; // Plan tier
    status: 'pending' | 'processing' | 'completed' | 'failed';
  };
  organization: {
    orgCode: string;
    orgName: string;
  };
}
```

## Key Methods Used

### client.purchases.createOrder()

Create a purchase order:

```typescript
const { order } = await client.purchases.createOrder({
  planCode: 'STARTER-MONTHLY',
  organizationData: {
    orgName: 'My Company',
    ownerName: 'John Doe',
    ownerEmail: 'john@example.com',
  },
});
```

### client.payments.createPayment()

Create a gateway-neutral payment:

```typescript
const payment = await client.payments.createPayment({
  gateway: 'stripe',
  orderId: order.orderId,
  amount: order.amount,
  currency: order.currency,
  organizationId: 123,
  planCode: 'STARTER-MONTHLY',
  email: 'john@example.com',
});
```

### client.purchases.completePurchase()

Complete the purchase after payment:

```typescript
const result = await client.purchases.completePurchase({
  orderId: 'ORDER-ID',
  paymentReference: 'PAYMENT-ID', // Stripe or Paystack reference
});

const license = result.license;
```

## Next Steps

- [Basic Validation](/examples/basic-validation) — Validate licenses
- [Onboarding Flow](/examples/onboarding-flow) — Guide users through activation
- [Dashboard Integration](/examples/dashboard-integration) — Show license info
