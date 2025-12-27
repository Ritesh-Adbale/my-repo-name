# SECURITY AND BACKUP IMPLEMENTATION

## Overview

This change implements client-only, PIN-derived AES encryption for all local data (Option 1), a PIN lock flow with auto-lock on background/tab change, and a scaffold for optional Google Drive encrypted backups (Option 2).

Highlights

- New reusable services: `secureStorage.ts`, `pinAuth.ts`, `driveBackup.ts` (in both `client/src/lib` and root `src/lib` for serverless contexts).
- New UI component: `PinLock` (`client/src/components/pin-lock.tsx`) with iOS-like lock UX and shake animation for incorrect PINs.
- Auto-lock listeners added to `client/src/App.tsx` using `visibilitychange`, `pagehide`, and `blur`.
- Documentation and design rationale in this file.

## Files changed/added

- `client/src/lib/secureStorage.ts`
  - Implements AES-GCM encryption helpers and localStorage wrappers: `saveSecure`, `loadSecure`, `clearSecure`, and `deriveKeyFromPin`.
- `client/src/lib/pinAuth.ts`
  - PIN creation and verification using PBKDF2-derived verifier. Exposes `setPin`, `verifyPin`, `hasPin`, `clearPin`, and `getEncryptionKeyFromPin`.
- `client/src/lib/driveBackup.ts`
  - Encrypt/decrypt helpers for export/import; placeholders for Drive upload/restore (requires OAuth client integration).
- `client/src/components/pin-lock.tsx` and `client/src/components/pin-lock.css`
  - Lock screen UI (create PIN / enter PIN) and shake animation.
- `client/src/App.tsx` — integration
  - Shows `PinLock` when app is locked and registers auto-lock events. Unlock provides a `CryptoKey` for any future encrypted operations.
- `SECURITY_AND_BACKUP_IMPLEMENTATION.md`
  - This document.

## Design decisions & security rationale

- AES Mode: AES-GCM (authenticated encryption) is used for confidentiality and tamper detection.
- Key derivation: PBKDF2 (SHA-256) with high iteration counts (150k for encryption key derivation, 200k for PIN verifier derivation) to slow brute-force attacks on short PINs. The encryption key is derived from the PIN and a stored master salt; the PIN verifier uses its own salt and derived bits.
- No plaintext PIN storage: only PBKDF2-derived verifier is stored (`localStorage`), and salts are stored separately. The app never writes the raw PIN to persistent storage.
- Local-only: All data remains in `localStorage` (encrypted) so the app works offline and as an iOS PWA.
- UI: The `PinLock` component simulates an iOS-style lock screen and uses a shake animation and error feedback on incorrect PIN.

## How it works (flow)

1. First launch

   - `PinLock` detects no PIN via `hasPin()` and prompts user to create a 4–6 digit PIN.
   - `setPin(pin)` generates a salt (`secure:pin_salt`) and stores a PBKDF2-derived verifier at `secure:pin_hash`.

2. Subsequent launches / unlocking

   - `App` mounts and checks `hasPin()`; if true, it renders `PinLock` and blocks the UI.
   - User enters PIN; `verifyPin(pin)` recomputes PBKDF2-derived bits and compares them to `secure:pin_hash`.
   - On success, `getEncryptionKeyFromPin(pin)` calls into `deriveKeyFromPin(pin)` which uses a master salt `secure:master_salt` to derive an AES-GCM `CryptoKey` used for `saveSecure` / `loadSecure` operations.

3. Saving data

   - Call `saveSecure(key, data, encryptionKey)` where `encryptionKey` comes from `getEncryptionKeyFromPin`.
   - The function encrypts the JSON payload with AES-GCM and stores an object `{ iv, ciphertext }` at `secure:${key}` in `localStorage`.

4. Loading data

   - Call `loadSecure(key, encryptionKey)` to decrypt and parse previously stored data.

5. Auto-lock

   - The app listens for `document.visibilitychange`, `pagehide`, and `blur` to immediately lock the UI when the user backgrounds or switches tabs (necessary for iOS PWA security).

6. Encrypted Export / Backup (Drive)
   - `client/src/lib/driveBackup.ts` exposes `encryptExport(payload, pin)` and `decryptImport(exported, pin)` to produce an encrypted JSON blob that can be uploaded to Google Drive AppData.
   - Upload/restore functions are intentionally left as placeholders because they require a Google OAuth client ID and a user-driven sign-in flow (no silent auth). See next section for integration guidance.

## Data storage layout (localStorage)

- `secure:master_salt` — app master salt (used to derive AES encryption keys)
- `secure:pin_salt` — PIN hashing salt
- `secure:pin_hash` — PBKDF2-derived PIN verifier (base64)
- `secure:<your-key>` — JSON string with `{ iv, ciphertext }` for encrypted payloads

## Security notes & limitations

- localStorage visibility: While encryption makes data unreadable without the PIN, an attacker with full access to the device (or DevTools) could copy the encrypted blobs and brute-force the PIN offline. Mitigations:
  - PBKDF2 iterations are deliberately high to slow brute-force attempts.
  - Recommend enabling a lockout or retry-limiting UI if desired (not implemented here to keep UX simple).
- PIN entropy: 4–6 digit PINs are relatively weak. Consider allowing a longer passphrase for stronger security.
- WebCrypto availability: All cryptographic code uses the browser `SubtleCrypto` API which is available in modern browsers. iOS Safari supports these APIs in recent versions but verify on target devices.
- Google Drive integration: The upload/restore placeholders require implementing OAuth with the Google Identity Services client and calling Drive API endpoints with the `appDataFolder` scope. That requires a client ID and user consent and is documented below.

## Google Drive integration notes (how-to)

1. Obtain a Google OAuth client ID and enable the Drive API. Use the `https://www.googleapis.com/auth/drive.appdata` scope.
2. Use Google Identity Services (GIS) to present a sign-in popup (explicit user consent only; no silent sign-in).
3. After sign-in, the app receives an access token which can be used to upload a file to the AppData folder via Drive REST API and to list/read it for restore.
4. Always encrypt the payload with `encryptExport(payload, pin)` before uploading. The service functions `uploadToDriveAppData` and `restoreFromDriveAppData` are placeholders that should implement the Drive REST calls.

## Future improvements

- Add retry-limiting and exponential backoff lockouts for repeated incorrect PIN attempts.
- Support optional stronger passphrases and/or integration with platform biometrics (as an optional convenience — require careful security review).
- Implement real Google Drive upload/restore helpers that perform incremental backups and merging.
- Consider migrating to IndexedDB for larger data sets (but still encrypted).

## Where to look in the codebase

- `client/src/lib/secureStorage.ts` — AES-GCM storage helpers.
- `client/src/lib/pinAuth.ts` — PIN lifecycle: set, verify, derive encryption key.
- `client/src/components/pin-lock.tsx` — Lock UI.
- `client/src/App.tsx` — Integration and auto-lock event listeners.
- `client/src/lib/driveBackup.ts` — Export/import helpers and Drive placeholders.

If you want, I can:

- Implement the Drive upload/restore flow (requires OAuth client ID and user consent flow).
- Add retry limits on PIN verification and a passphrase alternative.
