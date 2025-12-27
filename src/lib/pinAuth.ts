import { deriveKeyFromPin } from './secureStorage';

const PIN_HASH_KEY = 'secure:pin_hash';
const PIN_SALT_KEY = 'secure:pin_salt';

function toBase64(buf: ArrayBuffer) { return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function fromBase64(str: string) { const bin = atob(str); const arr = new Uint8Array(bin.length); for (let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i); return arr.buffer; }

async function ensurePinSalt(): Promise<Uint8Array> {
  const existing = localStorage.getItem(PIN_SALT_KEY);
  if (existing) return new Uint8Array(fromBase64(existing));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem(PIN_SALT_KEY, toBase64(salt.buffer));
  return salt;
}

// Create and store a PIN verifier (PBKDF2-derived blob) but never store raw PIN.
export async function setPin(pin: string) {
  if (!/^[0-9]{4,6}$/.test(pin)) throw new Error('PIN must be 4-6 digits');
  const enc = new TextEncoder();
  const salt = await ensurePinSalt();
  const saltArr = new Uint8Array(salt);
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(pin), { name: 'PBKDF2' }, false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltArr, iterations: 200_000, hash: 'SHA-256' }, keyMaterial, 256);
  localStorage.setItem(PIN_HASH_KEY, toBase64(derived));
}

export function hasPin(): boolean {
  return !!localStorage.getItem(PIN_HASH_KEY);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_HASH_KEY);
  if (!stored) return false;
  const saltStr = localStorage.getItem(PIN_SALT_KEY);
  if (!saltStr) return false;
  const salt = new Uint8Array(fromBase64(saltStr));
  const saltArr = new Uint8Array(salt);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(pin), { name: 'PBKDF2' }, false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltArr, iterations: 200_000, hash: 'SHA-256' }, keyMaterial, 256);
  return toBase64(derived) === stored;
}

export async function clearPin() {
  localStorage.removeItem(PIN_HASH_KEY);
  localStorage.removeItem(PIN_SALT_KEY);
}

// Helper to get encryption key for data operations — reuses deriveKeyFromPin (which uses master salt).
export async function getEncryptionKeyFromPin(pin: string) {
  return deriveKeyFromPin(pin);
}
