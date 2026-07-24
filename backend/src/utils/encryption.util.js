import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Gets a valid 32-byte Buffer from the AES_ENCRYPTION_KEY string/hex env var.
 */
const getEncryptionKey = () => {
  const secret = process.env.AES_ENCRYPTION_KEY || 'enterprise_aes_secret_key_32_bytes_len!';
  return crypto.createHash('sha256').update(String(secret)).digest();
};

/**
 * Encrypts cleartext string using AES-256-GCM.
 * Output format: iv:authTag:encryptedData (hex encoded)
 */
const encryptAES256 = (text) => {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('[Encryption Utility] Encryption error:', error.message);
    throw new Error('Encryption operation failed');
  }
};

/**
 * Decrypts encrypted hex string (iv:authTag:encryptedData) back to cleartext.
 */
const decryptAES256 = (cipherText) => {
  if (!cipherText || typeof cipherText !== 'string' || !cipherText.includes(':')) {
    return cipherText;
  }
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) return cipherText;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('[Encryption Utility] Decryption error:', error.message);
    return '[ENCRYPTED_DATA_DECRYPTION_ERROR]';
  }
};

export {
  encryptAES256,
  decryptAES256,
};
