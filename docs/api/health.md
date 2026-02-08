# Health API

The Health API is exposed via `client.health`.

These endpoints are useful for:

- startup checks
- status dashboards
- measuring latency
- verifying configuration

## Methods

### `client.health.getHealth()`

`GET /api/health`

### `client.health.getDatabaseHealth()`

`GET /api/health/database`

### `client.health.checkNow()`

`POST /api/health/check`

### `client.health.getEmailStatus()`

`GET /api/health/email-status`

## Related

- The client also provides `client.testConnection()` as a convenience wrapper.
