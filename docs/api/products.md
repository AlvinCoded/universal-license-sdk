# Products API

The Products API is exposed via `client.products`.

It supports both:

- **Public use**: listing products and pricing plans for a marketing/pricing page.
- **Admin use**: creating/updating products and plans.

## Public methods

### `client.products.getAll()`

Fetch all products.

```ts
const products = await client.products.getAll();
```

### `client.products.get(productCode)`

Convenience lookup that returns the matching product from `getAll()`.

```ts
const product = await client.products.get('MY-PRODUCT');
```

### `client.products.getPlans(productCode)`

Fetch pricing/subscription plans for a product.

This calls the public plans listing route and caches results (if caching is enabled).

```ts
const plans = await client.products.getPlans('MY-PRODUCT');
plans.forEach((plan) => {
  console.log(plan.plan_code, plan.price_amount, plan.price_currency);
});
```

### `client.products.getPlan(planCode)`

Fetch a plan by its code.

```ts
const plan = await client.products.getPlan('MY-PRODUCT-PRO-ANNUAL');
```

## Admin methods (JWT required)

Admin endpoints require a token:

```ts
client.setToken(token);
```

### `client.products.getPlansForProductAdmin(productCode)`

Fetch plans for a product using the admin route.

### `client.products.createProduct(data)`

Create a new product.

### `client.products.updateProduct(id, data)`

Update a product by numeric ID.

### `client.products.deleteProduct(id)`

Delete a product.

### `client.products.createPlan(data)`

Create a subscription plan.

### `client.products.updatePlan(id, data)`

Update a plan by numeric ID.

### `client.products.deletePlan(id)`

Delete a plan.

## Related

- Purchase flows: `/api/purchases`
- Plans module (admin): `/api/plans`
- Types: `/api/types`
