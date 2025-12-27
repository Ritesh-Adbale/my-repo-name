const STORAGE_PREFIX = 'secure:';
const SALT_KEY = STORAGE_PREFIX + 'master_salt';

function toBase64(buf: ArrayBuffer) { return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function fromBase64(str: string) { const bin = atob(str); const arr = new Uint8Array(bin.length); for (let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i); return arr.buffer; }

export type SecurePayload = { iv: string; ciphertext: string; tag?: string };

export async function ensureSalt(): Promise<Uint8Array> {
  const existing = localStorage.getItem(SALT_KEY);
  if (existing) return new Uint8Array(fromBase64(existing));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem(SALT_KEY, toBase64(salt.buffer));
  return salt;
}

export async function deriveKeyFromPin(pin: string, salt?: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const pinKey = await crypto.subtle.importKey('raw', enc.encode(pin), { name: 'PBKDF2' }, false, ['deriveKey']);
  if (!salt) salt = await ensureSalt();
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150_000, hash: 'SHA-256' },
    pinKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt','decrypt']
  );
}

export async function saveSecure(key: string, data: unknown, encryptionKey: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const plaintext = enc.encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, encryptionKey, plaintext);
  const payload: SecurePayload = { iv: toBase64(iv.buffer), ciphertext: toBase64(ciphertext) };
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(payload));
}

export async function loadSecure<T>(key: string, encryptionKey: CryptoKey): Promise<T | null> {
  const raw = localStorage.getItem(STORAGE_PREFIX + key);
  if (!raw) return null;
  try {
    const payload: SecurePayload = JSON.parse(raw);
    const iv = new Uint8Array(fromBase64(payload.iv));
    const ciphertext = fromBase64(payload.ciphertext);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, encryptionKey, ciphertext);
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(plain)) as T;
  } catch (err) {
    console.error('Failed to decrypt secure payload', err);
    return null;
  }
}

export function clearSecure() {
  const toRemove: string[] = [];
  for (let i=0;i<localStorage.length;i++) {
    const k = localStorage.key(i)!;
    if (k.startsWith(STORAGE_PREFIX)) toRemove.push(k);
  }
  toRemove.forEach(k => localStorage.removeItem(k));
}
