# Payments API

The Payments API is exposed via `client.payments`.

This module wraps payment-provider related endpoints (subscriptions, payment intents, portal
sessions, and gateway-neutral one-time payments).

### `client.payments.createPayment(request)`

`POST /api/payment/create-payment`

Gateway-neutral one-time payment creation.

## Methods

### `client.payments.createSubscription(request)`

`POST /api/payment/create-subscription`

### `client.payments.createPaymentIntent(request)`

`POST /api/payment/create-payment-intent`

### `client.payments.checkTrialEligibility(request)`

`POST /api/payment/check-trial-eligibility`

### `client.payments.cancelSubscription(request)`

`POST /api/payment/cancel-subscription`

### `client.payments.createPortalSession(request)`

`POST /api/payment/create-portal-session`

### `client.payments.getTrialStats()` (Admin)

`GET /api/payment/trial-stats`

### `client.payments.getSubscriptionDetails(subscriptionId)`

`GET /api/payment/subscription/:subscriptionId`

### `client.payments.handleWebhook(payload, signature)`

`POST /api/payment/webhook`

This helper adds the `stripe-signature` header for you (Stripe only).

## Notes

- Exact fields depend on your server’s payment provider integration.
- Treat webhook handling as server-to-server logic whenever possible.
- For Paystack, the webhook endpoint is server-side and verifies `x-paystack-signature` using your
  secret key.
