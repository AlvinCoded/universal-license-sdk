# Signature verification & Stripe flow (quick guide)

## Verifying signatures (getPublicKey + verifySignature) 🔐

1. Get the server public key via SDK:

```ts
const client = new LicenseClient({ baseUrl: 'https://license.example.com/api' });
const publicKey = await client.validation.getPublicKey();
```

2. Use `verifySignature` from `@universal-license/core` to validate signed payloads (e.g., offline
   validation or signed tokens):

```ts
import { verifySignature } from '@universal-license/core';

const valid = verifySignature(payload, signature, publicKey);
if (!valid) throw new Error('Invalid signature');
```

Note: the server's public key is rotated only by admins; cache it and refresh periodically.

---

## Stripe payment integration — recommended flow ✅

Server responsibilities (recommended):

- Create a PaymentIntent (or Checkout session) server-side using `stripe` and return `clientSecret`.
- On successful payment, generate the license using internal purchases flow and send the license via
  server side `client.purchases.completePurchase()` endpoint.
- Implement and secure webhooks to listen for `payment_intent.succeeded` and complete the order
  there when appropriate.

Frontend responsibilities:

- Use `@stripe/stripe-js`'s `loadStripe()` and `stripe.confirmCardPayment(clientSecret, {...})` to
  confirm payment.
- Avoid embedding secret keys on the frontend; only use `pk_...` publishable key.
- After confirming payment, call your server or rely on server webhook to finalize license
  generation.

Webhook best practices:

- Validate Stripe webhook signatures using
  `stripe.webhooks.constructEvent(payload, sig, endpointSecret)`.
- Idempotently handle events: check order status before completing it again.
- Log and alert on unexpected failures; never generate licenses without verifying payment intent
  metadata.

Example server sequence (simplified):

1. `POST /purchases/create-order` → returns `{ orderId, amount, clientSecret }`.
2. Frontend confirms payment using `clientSecret`.
3. Stripe sends `payment_intent.succeeded` → your webhook calls `POST /purchases/complete-purchase`
   (or your server completes the purchase logic directly) to return the license.

---

If you want I can add a short runnable example (server + frontend minimal) showing this sequence in
the `examples/` folder.
