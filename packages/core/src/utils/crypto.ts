/**
 * Client-side cryptographic utilities
 * Note: These are basic utilities. Server-side encryption/signing happens on backend
 */

/**
 * Generate a secure random string
 * Useful for generating tokens, IDs, etc.
 */
export async function generateRandomString(length: number = 32): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Browser environment
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js environment
    const { randomBytes } = await import('crypto');
    return randomBytes(length).toString('hex');
  }
}

/**
 * Hash a string using SHA-256
 */
export async function sha256(message: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } else {
    const { createHash } = await import('crypto');
    return createHash('sha256').update(message).digest('hex');
  }
}

/**
 * Encode data to Base64
 */
export function base64Encode(data: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(data);
  } else {
    return Buffer.from(data).toString('base64');
  }
}

/**
 * Decode Base64 data
 */
export function base64Decode(data: string): string {
  if (typeof atob !== 'undefined') {
    return atob(data);
  } else {
    return Buffer.from(data, 'base64').toString('utf-8');
  }
}

/**
 * Verify RSA signature (using the server's public key)
 *
 * The default server implementation signs with RSA-SHA256 and returns the
 * signature as a Base64 string.
 *
 * `data` must be byte-for-byte identical to what the server signed.
 */
export async function verifySignature(
  data: string,
  signature: string,
  publicKey: string
): Promise<boolean> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      // Browser environment
      const keyData = await importPublicKey(publicKey);
      const encoder = new TextEncoder();
      const signatureBuffer = base64ToBuffer(signature);

      return await crypto.subtle.verify(
        {
          name: 'RSASSA-PKCS1-v1_5',
        },
        keyData,
        signatureBuffer,
        encoder.encode(data)
      );
    } else {
      // Node.js environment
      const { createVerify } = await import('crypto');
      const verifier = createVerify('RSA-SHA256');
      verifier.update(data);
      verifier.end();
      return verifier.verify(publicKey, signature, 'base64');
    }
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Import RSA public key for signature verification
 */
async function importPublicKey(pemKey: string): Promise<CryptoKey> {
  // Remove PEM header/footer and decode
  const pemContents = pemKey
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');

  const binaryDer = base64ToBuffer(pemContents);

  return await crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    true,
    ['verify']
  );
}

/**
 * Convert Base64 to ArrayBuffer
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = base64Decode(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Secure compare two strings (timing-safe)
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Verify an RSA signature using a rotated keyset.
 *
 * If `kid` is provided, only that key is tried.
 * If `kid` is omitted, all keys are tried until one verifies.
 */
export async function verifySignatureWithKeySet(
  data: string,
  signature: string,
  keySet: Array<{ kid: string; publicKey: string }>,
  kid?: string
): Promise<{ valid: boolean; kid?: string }> {
  const keysToTry = kid ? keySet.filter((k) => k.kid === kid) : keySet;

  for (const key of keysToTry) {
    const ok = await verifySignature(data, signature, key.publicKey);
    if (ok) {
      return { valid: true, kid: key.kid };
    }
  }

  return { valid: false };
}
