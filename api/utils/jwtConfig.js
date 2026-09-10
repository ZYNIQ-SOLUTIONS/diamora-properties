/**
 * JWT Configuration & Secret Resolution
 * Ensures secure non-default secret in production environments.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && (!secret || secret === 'secret' || secret === 'supersecretkey_change_me_in_production')) {
    throw new Error('FATAL SECURITY ERROR: Insecure or default JWT_SECRET cannot be used in production.');
  }

  return secret || 'secret';
}

module.exports = { getJwtSecret };
