# Organizations API (Admin)

The Organizations API is exposed via `client.organizations`.

This is intended for admin dashboards.

## Methods

### `client.organizations.getAll()`

`GET /api/organizations`

### `client.organizations.get(id)`

`GET /api/organizations/:id`

Returns an organization plus license information.

### `client.organizations.create(request)`

`POST /api/organizations`

### `client.organizations.update(id, request)`

`PUT /api/organizations/:id`

### `client.organizations.delete(id)`

`DELETE /api/organizations/:id`

## Usage example

```ts
client.setToken(token);

const orgs = await client.organizations.getAll();
const org = await client.organizations.get(orgs[0].id);
```
