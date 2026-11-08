/**
 * Cryptographic and file integrity utilities using standard Web Crypto API.
 * Provides AES-256-GCM authenticated encryption and SHA-256 hashing.
 */

// Generate random IV for AES-GCM (12 bytes / 96 bits standard)
export function generateIV(): Uint8Array {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  return iv;
}

// Generate a random 256-bit symmetric key for the transfer session
export async function generateSessionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export CryptoKey to raw hex or base64 string
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exported))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Import CryptoKey from hex string
export async function importKey(hexKey: string): Promise<CryptoKey> {
  const bytes = new Uint8Array(hexKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  return await crypto.subtle.importKey(
    'raw',
    bytes,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt chunk using AES-256-GCM
export async function encryptChunk(chunk: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> {
  return await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as any
    },
    key,
    chunk
  );
}

// Decrypt chunk using AES-256-GCM
export async function decryptChunk(encryptedChunk: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> {
  return await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as any
    },
    key,
    encryptedChunk
  );
}

// Compute SHA-256 hash of a file or ArrayBuffer for integrity verification
export async function computeSHA256(data: ArrayBuffer | Blob): Promise<string> {
  let buffer: ArrayBuffer;
  if (data instanceof Blob) {
    buffer = await data.arrayBuffer();
  } else {
    buffer = data;
  }
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Sanitize filename against directory traversal and dangerous characters
export function sanitizeFilename(filename: string): string {
  // Strip control chars, null bytes, relative traversal '../'
  let safe = filename
    .replace(/[\0\x00-\x1f\x7f]/g, '')
    .replace(/\.\.+[/\\]/g, '')
    .replace(/[<>:"/\\|?*]/g, '_')
    .trim();

  if (!safe || safe === '.' || safe === '..') {
    safe = 'flowdrop_received_file_' + Date.now();
  }
  return safe;
}

// Human readable file size
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Human readable transfer speed
export function formatSpeed(bytesPerSec: number): string {
  if (!bytesPerSec || bytesPerSec <= 0) return '0 B/s';
  return `${formatBytes(bytesPerSec, 1)}/s`;
}

// Human readable remaining time
export function formatEta(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '--';
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  return `${mins}m ${secs}s`;
}
