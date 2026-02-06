const crypto = require('crypto');

/**
 * Generate HMAC SHA-256 signature for webhook payload
 * @param {string|object} payload - Payload to sign (will be stringified if object)
 * @param {string} secret - Secret key for HMAC
 * @returns {string} Hex-encoded HMAC signature
 */
const generateSignature = (payload, secret) => {
  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadString);
  return hmac.digest('hex');
};

/**
 * Verify HMAC signature using timing-safe comparison
 * @param {string|object} payload - Payload to verify
 * @param {string} signature - Signature to verify against
 * @param {string} secret - Secret key for HMAC
 * @returns {boolean} True if signature is valid
 */
const verifySignature = (payload, signature, secret) => {
  try {
    const expectedSignature = generateSignature(payload, secret);
    
    // Convert signatures to buffers for timing-safe comparison
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const providedBuffer = Buffer.from(signature, 'hex');
    
    // Ensure buffers are same length to prevent timing attacks
    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }
    
    // Use timing-safe comparison
    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  } catch (error) {
    // Invalid signature format or other error
    return false;
  }
};

/**
 * Check if timestamp is within acceptable window (prevents replay attacks)
 * @param {number|string} timestamp - Unix timestamp in milliseconds
 * @param {number} windowMs - Acceptable time window in milliseconds (default: 5 minutes)
 * @returns {boolean} True if timestamp is valid
 */
const isTimestampValid = (timestamp, windowMs = 300000) => {
  try {
    const timestampMs = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    const now = Date.now();
    const diff = Math.abs(now - timestampMs);
    
    return diff <= windowMs;
  } catch (error) {
    return false;
  }
};

/**
 * Generate timestamp for webhook requests
 * @returns {number} Current Unix timestamp in milliseconds
 */
const generateTimestamp = () => {
  return Date.now();
};

module.exports = {
  generateSignature,
  verifySignature,
  isTimestampValid,
  generateTimestamp
};
