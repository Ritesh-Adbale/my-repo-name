import { deriveKeyFromPin } from './secureStorage';

// This module provides helpers to export encrypted data and to decrypt an exported blob.
// Google Drive upload/restore functions are placeholders because they require OAuth client credentials.

export async function encryptExport(payload: unknown, pin: string): Promise<string> {
  const key = await deriveKeyFromPin(pin);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(payload)));
  const blob = { iv: btoa(String.fromCharCode(...iv)), ciphertext: btoa(String.fromCharCode(...new Uint8Array(ct))) };
  return JSON.stringify(blob);
}

export async function decryptImport(exported: string, pin: string): Promise<any> {
  const key = await deriveKeyFromPin(pin);
  const parsed = JSON.parse(exported);
  const iv = new Uint8Array(atob(parsed.iv).split('').map(c => c.charCodeAt(0)));
  const ciphertext = new Uint8Array(atob(parsed.ciphertext).split('').map(c => c.charCodeAt(0))).buffer;
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(plain));
}

// Placeholder: uploads should use Google Drive AppData folder with OAuth token
export async function uploadToDriveAppData(encryptedJson: string, accessToken: string): Promise<void> {
  throw new Error('uploadToDriveAppData requires Google OAuth client integration. See SECURITY_AND_BACKUP_IMPLEMENTATION.md');
}

export async function restoreFromDriveAppData(accessToken: string): Promise<string> {
  throw new Error('restoreFromDriveAppData requires Google OAuth client integration. See SECURITY_AND_BACKUP_IMPLEMENTATION.md');
}
