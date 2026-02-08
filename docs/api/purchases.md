# Purchases API

The Purchases API is exposed via `client.purchases`.

It is designed for a common “pricing page → checkout → license issued” workflow.

## Core purchase flow

### 1) Create an order

`client.purchases.createOrder(request)`

This creates a server-side purchase order and returns details like amount/currency and an `orderId`.

```ts
const order = await client.purchases.createOrder({
  planCode: 'MY-PRODUCT-PRO-ANNUAL',
  organizationData: {
    orgName: 'Acme Corp',
    ownerName: 'Jane Doe',
    ownerEmail: 'jane@acme.com',
  },
  paymentMethod: 'stripe',
});

console.log(order.orderId);
```

### 2) Complete the purchase

`client.purchases.completePurchase(request)`

After your payment provider confirms payment, call `completePurchase` with the order ID and a
payment reference.

```ts
const result = await client.purchases.completePurchase({
  orderId: order.orderId,
  paymentReference: 'pi_...',
});

console.log('License Key:', result.license.licenseKey);
```

### 3) Look up an order

`client.purchases.getOrder(orderId)`

Useful for “return from checkout” pages.

```ts
const orderDetails = await client.purchases.getOrder(order.orderId);
console.log(orderDetails.paymentStatus);
```

## Admin methods (JWT required)

### `client.purchases.getAll(filters?)`

Fetch purchase orders (optionally filtered).

### `client.purchases.getAllSummary(limit?)`

Fetch purchases plus a count.

## Related

- Products + plans listing: `/api/products`
- Payment endpoints (admin): `/api/payments`
