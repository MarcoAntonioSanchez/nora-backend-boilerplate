import 'dotenv/config';

/**
 * Reads and validates the application environment variables.
 */

const nodeEnv = process.env.NODE_ENV ?? 'development';
const host = process.env.HOST ?? '0.0.0.0';
const portValue = process.env.PORT ?? '3000';
const port = Number(portValue);

// Database environment variables.
const dbServer = process.env.DB_SERVER;
const dbPortValue = process.env.DB_PORT ?? '1433';
const dbPort = Number(dbPortValue);
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbEncryptValue = process.env.DB_ENCRYPT ?? 'true';
const dbTrustServerCertificateValue = process.env.DB_TRUST_SERVER_CERTIFICATE ?? 'false';

// Authentication environment variables.
const authUsername = process.env.AUTH_USERNAME;
const authPasswordHash = process.env.AUTH_PASSWORD_HASH;
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '15m';

// CORS environment variables.
const corsOriginsValue =
  process.env.CORS_ORIGINS ?? (nodeEnv === 'production' ? '' : 'http://localhost:4321');

// Validate NODE_ENV.
if (!['development', 'production', 'test'].includes(nodeEnv)) {
  throw new Error(`Invalid NODE_ENV: "${nodeEnv}". Expected development, production or test.`);
}

// Validate HOST.
if (typeof host !== 'string' || host.trim().length === 0) {
  throw new Error('HOST must be a non-empty string.');
}

// Validate PORT.
if (!/^\d+$/.test(portValue) || !Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

// Validate database connection settings.
for (const [name, value] of Object.entries({
  DB_SERVER: dbServer,
  DB_NAME: dbName,
  DB_USER: dbUser,
  DB_PASSWORD: dbPassword,
})) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${name} must be a non-empty string.`);
  }
}

// Validate DB_PORT.
if (!/^\d+$/.test(dbPortValue) || !Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
  throw new Error('DB_PORT must be an integer between 1 and 65535.');
}

// Validate authentication environment variables.
for (const [name, value] of Object.entries({
  AUTH_USERNAME: authUsername,
  AUTH_PASSWORD_HASH: authPasswordHash,
  JWT_SECRET: jwtSecret,
})) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${name} must be a non-empty string.`);
  }
}

// Validate Argon2id password hash.
if (!authPasswordHash.startsWith('$argon2id$')) {
  throw new Error('AUTH_PASSWORD_HASH must be a valid Argon2id hash.');
}

// Validate JWT secret strength.
if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must contain at least 32 characters.');
}

// Validate JWT expiration format.
if (!/^\d+(s|m|h|d)$/.test(jwtExpiresIn)) {
  throw new Error('JWT_EXPIRES_IN must use a valid duration (e.g. 15m, 1h or 7d).');
}

// Validate CORS origins.
if (corsOriginsValue.trim().length === 0) {
  throw new Error('CORS_ORIGINS must contain at least one allowed origin.');
}

const corsOrigins = corsOriginsValue.split(',').map((origin) => origin.trim());

for (const origin of corsOrigins) {
  let parsedOrigin;

  try {
    parsedOrigin = new URL(origin);
  } catch {
    throw new Error(`Invalid CORS origin: "${origin}".`);
  }

  if (!['http:', 'https:'].includes(parsedOrigin.protocol) || parsedOrigin.origin !== origin) {
    throw new Error(`Invalid CORS origin: "${origin}".`);
  }

  // Require HTTPS origins in production.
  if (nodeEnv === 'production' && parsedOrigin.protocol !== 'https:') {
    throw new Error(`CORS origin must use HTTPS in production: "${origin}".`);
  }
}

// Validate database TLS boolean settings.
function parseBoolean(name, value) {
  if (value !== 'true' && value !== 'false') {
    throw new Error(`${name} must be either "true" or "false".`);
  }

  return value === 'true';
}

const dbEncrypt = parseBoolean('DB_ENCRYPT', dbEncryptValue);
const dbTrustServerCertificate = parseBoolean(
  'DB_TRUST_SERVER_CERTIFICATE',
  dbTrustServerCertificateValue,
);

// Enforce secure database TLS configuration in production.
if (nodeEnv === 'production') {
  if (!dbEncrypt) {
    throw new Error('DB_ENCRYPT must be true in production.');
  }

  if (dbTrustServerCertificate) {
    throw new Error('DB_TRUST_SERVER_CERTIFICATE must be false in production.');
  }
}

/**
 * Immutable application configuration.
 */
export const env = Object.freeze({
  nodeEnv,
  host,
  port,
  database: Object.freeze({
    server: dbServer,
    port: dbPort,
    name: dbName,
    user: dbUser,
    password: dbPassword,
    options: Object.freeze({
      encrypt: dbEncrypt,
      trustServerCertificate: dbTrustServerCertificate,
    }),
  }),
  auth: Object.freeze({
    username: authUsername,
    passwordHash: authPasswordHash,
    jwtSecret,
    jwtExpiresIn,
  }),
  cors: Object.freeze({
    origins: Object.freeze(corsOrigins),
  }),
});
