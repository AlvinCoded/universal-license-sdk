# Auth API (Admin)

The Auth API is exposed via `client.auth`.

It is used to obtain and manage a JWT for admin endpoints.

## Methods

### `client.auth.login(request)`

`POST /api/auth/login`

```ts
const login = await client.auth.login({
  username: 'admin',
  password: 'your-password',
});

client.setToken(login.token);
```

### `client.auth.verify()`

`GET /api/auth/verify`

Verifies the current token (must already be set on the client).

```ts
client.setToken(token);
const res = await client.auth.verify();
console.log(res.user);
```

### `client.auth.updateProfile(request)`

`PATCH /api/auth/profile`

Update profile fields for the current admin user.

## Notes

- Admin endpoints generally require `Authorization: Bearer <token>`.
- The SDK automatically attaches the token when you set `apiKey` / `setToken`.
