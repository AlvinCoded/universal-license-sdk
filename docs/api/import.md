# Import API (Admin)

The Import API is exposed via `client.imports`.

It provides multipart/form-data upload endpoints for validating, previewing, and executing imports.

## Methods

### `client.imports.validate(dataType, file, format?)`

`POST /api/import/:dataType/validate`

### `client.imports.preview(dataType, file, options?)`

`POST /api/import/:dataType/preview`

### `client.imports.execute(dataType, file, options?)`

`POST /api/import/:dataType`

## Notes

- These methods use `postForm(...)` internally and require a `FormData` implementation.
- In browsers, `FormData` is built-in.
- In Node.js, ensure you have a compatible `FormData` available if you call these routes.
