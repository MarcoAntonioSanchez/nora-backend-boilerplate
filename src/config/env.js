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
});
