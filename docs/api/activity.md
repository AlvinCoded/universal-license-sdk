# Activity API (Admin)

The Activity API is exposed via `client.activity`.

It is intended for admin dashboards and audit trails.

## Methods

### `client.activity.getLogs(limit?)`

`GET /api/activity/logs?limit=...`

```ts
client.setToken(token);
const logs = await client.activity.getLogs(100);
```

### `client.activity.getValidationLogs(licenseKey, limit?)`

`GET /api/activity/validation/:licenseKey?limit=...`

```ts
const validationLogs = await client.activity.getValidationLogs(licenseKey, 50);
```
