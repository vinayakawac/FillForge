// ============================================================
// FillForge — Crypto Utilities
// Salt-derived AES-GCM encryption for API key storage
// ============================================================

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_PREFIX = 'fillforge-key-salt-';

function getSalt(): Uint8Array {
  // Derive salt from extension ID for reproducible key derivation
  const extensionId = typeof chrome !== 'undefined' && chrome.runtime?.id
    ? chrome.runtime.id
    : 'fillforge-dev-mode';
  const saltStr = SALT_PREFIX + extensionId;
  return new TextEncoder().encode(saltStr);
}

async function deriveKey(): Promise<CryptoKey> {
  const salt = getSalt();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    salt,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptKey(plaintext: string): Promise<string> {
  if (!plaintext) return '';

  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  );

  // Pack IV + ciphertext as base64
  const packed = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(ciphertext), IV_LENGTH);

  return btoa(String.fromCharCode(...packed));
}

export async function decryptKey(encrypted: string): Promise<string> {
  if (!encrypted) return '';

  try {
    const key = await deriveKey();
    const packed = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

    const iv = packed.slice(0, IV_LENGTH);
    const ciphertext = packed.slice(IV_LENGTH);

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    console.error('[FillForge] Failed to decrypt key — may be corrupted or from different extension ID');
    return '';
  }
}
