use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use sha2::{Digest, Sha256};
use std::io::{Read, Write};
use std::path::Path;

pub const CHUNK_SIZE: usize = 64 * 1024; // 64 KB chunks

/// Encrypt a chunk using hardware-accelerated AES-256-GCM
pub fn encrypt_chunk(
    chunk: &[u8],
    key_bytes: &[u8; 32],
    nonce_bytes: &[u8; 12],
) -> Result<Vec<u8>, String> {
    let cipher = Aes256Gcm::new_from_slice(key_bytes).map_err(|e| e.to_string())?;
    let nonce = Nonce::from_slice(nonce_bytes);
    cipher
        .encrypt(nonce, chunk)
        .map_err(|e| format!("Encryption error: {:?}", e))
}

/// Decrypt an authenticated chunk
pub fn decrypt_chunk(
    encrypted: &[u8],
    key_bytes: &[u8; 32],
    nonce_bytes: &[u8; 12],
) -> Result<Vec<u8>, String> {
    let cipher = Aes256Gcm::new_from_slice(key_bytes).map_err(|e| e.to_string())?;
    let nonce = Nonce::from_slice(nonce_bytes);
    cipher
        .decrypt(nonce, encrypted)
        .map_err(|e| format!("Decryption integrity violation: {:?}", e))
}

/// Compute streaming SHA-256 hash
pub fn compute_sha256<P: AsRef<Path>>(path: P) -> Result<String, std::io::Error> {
    let mut file = std::fs::File::open(path)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 32 * 1024];

    loop {
        let bytes_read = file.read(&mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        hasher.update(&buffer[..bytes_read]);
    }

    let result = hasher.finalize();
    Ok(format!("{:x}", result))
}
