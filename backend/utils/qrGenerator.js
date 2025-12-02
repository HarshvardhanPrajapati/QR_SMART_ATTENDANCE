// ../utils/qrGenerator.js
const crypto = require('crypto');

// Derive a 32-byte key from the secret (so env var length won't break things)
const secret = process.env.QR_SECRET_KEY || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const KEY = crypto.createHash('sha256').update(secret).digest(); // 32 bytes
const algorithm = 'aes-256-ctr';

// Generate QR data (IV is fresh for each QR)
const generateQRData = (sessionId, courseId, expiresIn) => {
  const data = JSON.stringify({
    sessionId,
    courseId,
    generatedAt: Date.now(),
    expiresIn
  });

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, KEY, iv);
  let encrypted = cipher.update(data, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  };
};

/**
 * validateQRData(hash)
 * Accepts:
 *  - an object { iv, content }
 *  - a JSON string '{"iv":"...", "content":"..."}'
 *  - a string "iv:content"  (common compact format)
 *
 * Returns parsed data object on success or null on failure.
 */
const validateQRData = (hash) => {
  try {
    if (!hash) return null;

    let payload = hash;

    // If scanner sent a string, try parse it
    if (typeof payload === 'string') {
      payload = payload.trim();

      // Try JSON
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        // Not JSON — try iv:content
        if (payload.includes(':')) {
          const [ivPart, contentPart] = payload.split(':');
          payload = { iv: ivPart, content: contentPart };
        } else {
          return null;
        }
      }
    }

    // Now payload should be an object with iv & content
    if (!payload || !payload.iv || !payload.content) return null;

    const ivBuf = Buffer.from(payload.iv, 'hex');
    const encryptedBuf = Buffer.from(payload.content, 'hex');

    if (ivBuf.length !== 16) return null; // invalid IV size

    const decipher = crypto.createDecipheriv(algorithm, KEY, ivBuf);
    let decrypted = decipher.update(encryptedBuf);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    const parsed = JSON.parse(decrypted.toString('utf8'));
    return parsed;
  } catch (error) {
    // console.debug('validateQRData error:', error);
    return null;
  }
};

module.exports = { generateQRData, validateQRData };
