# Ownership & Invites API

The Ownership & Invites API is exposed via `client.ownership` (JavaScript/TypeScript SDK).

This module is intended for **app onboarding** flows where a license can be “claimed” by a primary
owner and then shared via server-issued invite codes.

## Headers (important)

These endpoints are **app-scoped** and typically require an application key:

- `X-ULS-App-Key: <your-app-key>`

In the JS SDK, set this once in `SDKConfig`:

```ts
import { LicenseClient } from '@universal-license/client';

const client = new LicenseClient({
  baseUrl: 'https://license.example.com/api',
  appKey: 'YOUR_APP_KEY',
});
```

## Methods

### `client.ownership.getStatus(licenseKey)`

Checks whether the license has been claimed by an app-side owner.

- `GET /api/licenses/:licenseKey/ownership`

```ts
const status = await client.ownership.getStatus('LIC-...');
// { ownerClaimed: boolean, claimedAt?: string, ownerPublicKey?: string }
```

### `client.ownership.claimOwner(licenseKey, request)`

Claims ownership (first claim wins). Returns an **owner token**.

- `POST /api/licenses/:licenseKey/claim-owner`

```ts
import { DeviceFingerprint } from '@universal-license/client';

const deviceId = await DeviceFingerprint.generate();

const claim = await client.ownership.claimOwner('LIC-...', {
  deviceId,
  // optional; only if your onboarding flow uses an owner public key
  ownerPublicKey: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
});

// claim.ownerToken
// claim.tokenExpiresIn
```

### `client.ownership.createInvite(licenseKey, request?)`

Creates a server-managed invite code. This endpoint typically requires an **owner token** (returned
by `claimOwner`).

- `POST /api/licenses/:licenseKey/invites`

```ts
// Make sure your SDK instance has the appropriate token configured.
client.setToken(claim.ownerToken);

const invite = await client.ownership.createInvite('LIC-...', {
  expiresInMinutes: 60,
  maxUses: 1,
});

// invite.inviteCode
// invite.expiresAt
```

### `client.ownership.redeemInvite(licenseKey, request)`

Redeems an invite code and returns a short-lived **grant token**.

- `POST /api/licenses/:licenseKey/invites/redeem`

```ts
const deviceId = await DeviceFingerprint.generate();

const redeemed = await client.ownership.redeemInvite('LIC-...', {
  inviteCode: invite.inviteCode,
  deviceId,
});

// redeemed.grantToken
// redeemed.tokenExpiresIn
```

## Notes

- This module is currently documented for the JS/TS SDK because it is implemented as
  `OwnershipModule` there.
- Your server defines the meaning and authorization of the returned tokens; treat them like secrets.
