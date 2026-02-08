# Export API (Admin)

The Export API is exposed via `client.exports`.

It supports exporting licenses and purchases in multiple formats.

## Methods

### `client.exports.exportLicenses(format)`

`GET /api/export/licenses/:format`

### `client.exports.exportPurchases(format)`

`GET /api/export/purchases/:format`

## Formats

The `format` is an `ExportFormat`.

The SDK handles response types:

- `xlsx` → `ArrayBuffer`
- `csv` → `string`
- others → parsed JSON
