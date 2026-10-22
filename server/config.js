const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET) {
  if (isProduction) {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  console.warn('WARNING: JWT_SECRET is not set. Using an insecure development-only default.');
}

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'dev-only-insecure-secret-do-not-use-in-production',
};
