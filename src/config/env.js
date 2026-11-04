/**
 * Reads and validates the application environment variables.
 */

const nodeEnv = process.env.NODE_ENV ?? 'development';
const host = process.env.HOST ?? '0.0.0.0';
const portValue = process.env.PORT ?? '3000';
const port = Number(portValue);

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

/**
 * Immutable application configuration.
 */
export const env = Object.freeze({
  nodeEnv,
  host,
  port,
});
