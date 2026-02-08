# Purchase Workflows

## Overview

Purchase workflows handle the complete process from creating orders through completing payments and
receiving licenses. The SDK provides methods to manage the entire purchase lifecycle.

## Creating Purchase Orders

### Basic Order Creation

```javascript
const { order } = await client.purchases.createOrder({
  planCode: 'PROD-PRO', // Tier/plan code
  organizationData: {
    orgName: 'Example Organization',
    ownerName: 'Jane Doe',
    ownerEmail: 'owner@example.com',
    orgType: 'Company',
    address: '123 Example Street, City, State, ZIP',
    phone: '+1 (555) 123-4567',
    country: 'USA',
  },
});

console.log(`Order created: ${order.orderId}`);
console.log(`Amount: ${order.amount} ${order.currency}`);
```

The SDK creates an order that represents a customer's intent to purchase a plan. This happens before
payment is processed.

### Order Response

```javascript
{
    order: {
        orderId: 'ORDER-1234567890-ABCDEFGHI',
        amount: 599.99,
        currency: 'USD',
        planName: 'Pro Plan',
        tier: 'pro',
        status: 'pending'
    },
    organization: {
        orgCode: 'ORG-1234567890-ABCDEFGHI',
        orgName: 'Example Organization'
    }
}
```

Store the `orderId` - you'll need it after payment to complete the purchase.

## Payment Integration

After creating an order, create a payment with the gateway-neutral endpoint and complete the gateway
flow client-side:

### Create Payment (Gateway-Neutral)

```javascript
const { order } = await client.purchases.createOrder({
  planCode: 'PROD-PRO',
  organizationData: {
    orgName: 'Example Organization',
    ownerName: 'Jane Doe',
    ownerEmail: 'owner@example.com',
  },
});

const payment = await client.payments.createPayment({
  gateway: 'stripe',
  orderId: order.orderId,
  amount: order.amount,
  currency: order.currency,
  organizationId: 123, // Use your server-side org ID
  planCode: 'PROD-PRO',
  email: 'owner@example.com',
});
```

### Stripe (PaymentIntent)

```javascript
import { loadStripe } from '@stripe/stripe-js';

async function processStripePayment(payment) {
  const stripe = await loadStripe('pk_test_YOUR_STRIPE_KEY');

  if (payment.gateway !== 'stripe' || payment.type !== 'payment_intent') {
    throw new Error('Expected Stripe payment intent response');
  }

  const result = await stripe.confirmCardPayment(payment.clientSecret);

  if (result.error) {
    console.error('Payment failed:', result.error.message);
    return false;
  }

  return result.paymentIntent?.id || true;
}
```

### Paystack (Redirect)

```javascript
function processPaystackPayment(payment) {
  if (payment.gateway !== 'paystack' || payment.type !== 'redirect') {
    throw new Error('Expected Paystack redirect response');
  }

  window.location.href = payment.authorizationUrl;
}
```

## Completing Purchases

After successful payment, complete the purchase to generate the license. This should be done
server-side after verifying the gateway webhook:

```javascript
const purchase = await client.purchases.completePurchase({
  orderId: 'ORDER-1234567890-ABCDEFGHI',
  paymentReference: 'gateway_payment_reference',
});

if (purchase.success) {
  console.log('Purchase completed!');
  console.log(`License: ${purchase.license.licenseKey}`);
  console.log(`Expires: ${purchase.license.expiresAt}`);
}
```

The `paymentReference` should be a unique identifier from your payment gateway that can be traced
back to the payment.

### Purchase Response

```javascript
{
    success: true,
    license: {
        licenseKey: 'PROD-ORG-2025-XXXX-XXXX-XXXX',
        tier: 'pro',
        status: 'active',
        organizationName: 'Example Organization',
        expiresAt: '2026-01-20T23:59:59Z',
        features: {
            memberManagement: true,
            advancedReporting: true,
            financialManagement: true
        },
        maxUsers: 50
    },
    organization: {
        orgCode: 'ORG-1234567890-ABCDEFGHI',
        orgName: 'Example Organization'
    }
}
```

## Complete Purchase Flow

Here's a complete example from order to delivery:

```javascript
async function completePurchaseFlow(planCode, organizationData) {
  try {
    // Step 1: Create order
    console.log('Creating order...');
    const { order } = await client.purchases.createOrder({
      planCode,
      organizationData,
    });
    console.log(`Order created: ${order.orderId}`);

    // Step 2: Process payment
    console.log('Processing payment...');
    const paymentRef = await processPayment(order);
    if (!paymentRef) {
      console.error('Payment failed');
      return null;
    }
    console.log(`Payment processed: ${paymentRef}`);

    // Step 3: Complete purchase
    console.log('Completing purchase...');
    const purchase = await client.purchases.completePurchase({
      orderId: order.orderId,
      paymentReference: paymentRef,
    });

    if (!purchase.success) {
      console.error('Purchase completion failed');
      return null;
    }

    console.log('Purchase successful!');
    console.log(`License key: ${purchase.license.licenseKey}`);

    // Step 4: Deliver to customer
    await sendLicenseEmail(
      organizationData.ownerEmail,
      purchase.license.licenseKey,
      purchase.license.expiresAt
    );

    return purchase;
  } catch (error) {
    console.error('Purchase flow failed:', error.message);
    throw error;
  }
}

// Usage
const purchase = await completePurchaseFlow('PROD-PRO', {
  orgName: 'Example Organization',
  ownerName: 'Jane Doe',
  ownerEmail: 'owner@example.com',
  orgType: 'Company',
});
```

## Getting Purchase Orders

Retrieve orders for tracking and management:

```javascript
// Get specific order
const order = await client.purchases.getOrder('ORDER-1234567890-ABCDEFGHI');

console.log(`Order status: ${order.status}`); // pending, completed, failed, cancelled
console.log(`Amount: ${order.amount} ${order.currency}`);
console.log(`Created: ${order.createdAt}`);

// Get all orders (admin only)
const orders = await client.purchases.getAll();

const pendingOrders = orders.filter((o) => o.status === 'pending');
const completedOrders = orders.filter((o) => o.status === 'completed');
```

## Error Handling in Purchases

Handle various failure scenarios:

```javascript
import { PurchaseError, NetworkError } from '@universal-license/client';

async function handlePurchaseError(error, order) {
  if (error instanceof PurchaseError) {
    if (error.message.includes('duplicate')) {
      // Duplicate order - same order already exists
      console.log('Order already exists, retrieving...');
      return await client.purchases.getOrder(order.orderId);
    } else if (error.message.includes('invalid plan')) {
      // Plan doesn't exist or is invalid
      console.log('Selected plan is invalid');
      showPlanSelectionError();
    } else {
      console.log('Purchase error:', error.message);
    }
  } else if (error instanceof NetworkError) {
    // Network issue - retry is handled automatically
    console.log('Network error during purchase');
    showNetworkError();
  }
}
```

## Webhook Handling

When using payment gateways with webhooks, handle payment confirmations:

```javascript
// Node.js/Express webhook endpoint
app.post('/webhook/payment', async (req, res) => {
  const event = req.body;

  try {
    if (event.type === 'payment.succeeded') {
      const paymentIntentId = event.data.paymentIntentId;
      const orderId = event.data.metadata.orderId;

      // Complete purchase using SDK
      const purchase = await client.purchases.completePurchase({
        orderId,
        paymentReference: paymentIntentId,
      });

      if (purchase.success) {
        // Send license to customer
        await sendLicenseEmail(purchase.organization.email, purchase.license.licenseKey);

        res.json({ success: true });
      }
    } else if (event.type === 'payment.failed') {
      // Handle payment failure
      console.error('Payment failed for order:', event.data.orderId);
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).json({ error: error.message });
  }
});
```

## React Purchase Component

```jsx
import { useState } from 'react';
import { usePurchase } from '@universal-license/react';
import { PurchaseError } from '@universal-license/client';

export function PurchaseFlow({ planCode, onSuccess }) {
  const [step, setStep] = useState('organization'); // organization, payment, complete
  const [organizationData, setOrganizationData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { createOrder, completePurchase } = usePurchase();

  const handleCreateOrder = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const { order } = await createOrder({
        planCode,
        organizationData: data,
      });

      setOrganizationData(data);
      // Store order for payment processing
      sessionStorage.setItem('currentOrder', JSON.stringify(order));
      setStep('payment');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = async (paymentRef) => {
    setLoading(true);
    setError(null);

    try {
      const order = JSON.parse(sessionStorage.getItem('currentOrder'));

      const result = await completePurchase({
        orderId: order.orderId,
        paymentReference: paymentRef,
      });

      if (result.success) {
        setStep('complete');
        onSuccess(result.license);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {step === 'organization' && (
        <OrganizationForm onSubmit={handleCreateOrder} loading={loading} error={error} />
      )}

      {step === 'payment' && (
        <PaymentForm onSubmit={handleCompletePayment} loading={loading} error={error} />
      )}

      {step === 'complete' && <PurchaseComplete />}
    </div>
  );
}
```

## Purchase Status Tracking

Monitor order status throughout the flow:

```javascript
async function trackPurchaseStatus(orderId) {
  let status = 'pending';
  let attempts = 0;
  const maxAttempts = 30; // Check for 5 minutes (30 attempts * 10 seconds)

  while (status === 'pending' && attempts < maxAttempts) {
    const order = await client.purchases.getOrder(orderId);
    status = order.status;

    if (status === 'completed') {
      console.log('Purchase completed!');
      return order;
    } else if (status === 'failed') {
      throw new Error('Purchase failed');
    } else if (status === 'cancelled') {
      throw new Error('Purchase was cancelled');
    }

    // Wait before checking again
    await new Promise((resolve) => setTimeout(resolve, 10000));
    attempts++;
  }

  throw new Error('Purchase status check timed out');
}

// Usage
try {
  const completedOrder = await trackPurchaseStatus('ORDER-1234567890-ABCDEFGHI');
} catch (error) {
  console.error('Purchase tracking failed:', error.message);
}
```

## Next Steps

- [License Validation](/guide/license-validation) - Validate purchased licenses
- [Renewal and Expiration](/guide/renewal-and-expiration) - Handle license renewals
- [Error Handling](/guide/error-handling) - Handle purchase errors
