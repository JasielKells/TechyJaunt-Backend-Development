const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generates a signed JWT for login/authorization.
 */
const generateJWT = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

/**
 * Generates a cryptographically random token for email verification.
 * Returns the RAW token (to send via email) and its SHA-256 HASH
 * (to store in DB). We never store the raw token.
 */
const generateVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  const expiresHours = Number(process.env.VERIFICATION_TOKEN_EXPIRES_HOURS) || 24;
  const expiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000);

  return { rawToken, hashedToken, expiresAt };
};

module.exports = { generateJWT, generateVerificationToken };