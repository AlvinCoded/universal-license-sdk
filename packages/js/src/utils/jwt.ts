import { base64Decode, verifySignature } from '@unilic/core';

function base64UrlToBase64(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  return base64 + '='.repeat(padLength);
}

function decodeJsonPart(partB64Url: string): unknown {
  const json = base64Decode(base64UrlToBase64(partB64Url));
  return JSON.parse(json);
}

export type JwtVerifyResult<TPayload = unknown> =
  | { valid: true; header: unknown; payload: TPayload }
  | { valid: false };

/**
 * Minimal RS256 JWT verification for offline-capable clients.
 *
 * - Verifies the RSASSA-PKCS1-v1_5 (SHA-256) signature using the provided public key.
 * - Does not perform claim validation; callers should validate exp/iss/aud/etc.
 */
export async function verifyJwtRs256<TPayload = unknown>(params: {
  token: string;
  publicKey: string;
}): Promise<JwtVerifyResult<TPayload>> {
  const parts = params.token.split('.');
  if (parts.length !== 3) return { valid: false };

  const [headerB64Url, payloadB64Url, sigB64Url] = parts;

  let header: unknown;
  let payload: unknown;
  try {
    header = decodeJsonPart(headerB64Url);
    payload = decodeJsonPart(payloadB64Url);
  } catch {
    return { valid: false };
  }

  // JWT signing input is the original base64url parts joined with '.'
  const signingInput = `${headerB64Url}.${payloadB64Url}`;

  // RS256 signature is base64url-encoded; core verifier expects base64.
  const signatureBase64 = base64UrlToBase64(sigB64Url);

  const ok = await verifySignature(signingInput, signatureBase64, params.publicKey);
  if (!ok) return { valid: false };

  return { valid: true, header, payload: payload as TPayload };
}
