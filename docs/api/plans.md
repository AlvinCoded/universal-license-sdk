# Plans API

The Plans API is exposed via `client.plans`.

This module is primarily for admin tools, but the `get(planCode)` and `getByProduct(productCode)`
routes can also be useful when rendering plan information.

## Methods

### `client.plans.getAll()` (Admin)

`GET /api/plans`

```ts
client.setToken(token);
const plans = await client.plans.getAll();
```

### `client.plans.get(planCode)`

`GET /api/plans/:planCode`

```ts
const plan = await client.plans.get('MY-PRODUCT-PRO-ANNUAL');
```

### `client.plans.getByProduct(productCode)`

`GET /api/plans/product/:productCode`

```ts
const plans = await client.plans.getByProduct('MY-PRODUCT');
```

### `client.plans.create(request)` (Admin)

`POST /api/plans/create`

### `client.plans.delete(planId)` (Admin)

`DELETE /api/plans/:id`

## Related

- Public pricing plans listing: see `client.products.getPlans(productCode)` in `/api/products`.
