import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

/**
 * Executes env.js in an isolated Node.js process.
 *
 * The test environment uses dummy credentials. No real secrets are exposed.
 *
 * @param {{ encrypt: string, trustServerCertificate: string }} tls
 * @param {string} [corsOrigins]
 */
function loadProductionEnvironment(tls, corsOrigins = 'https://example.com') {
  return spawnSync(
    process.execPath,
    ['--input-type=module', '-e', "import('./src/config/env.js')"],
    {
      encoding: 'utf8',
      env: {
        ...process.env,

        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: '3000',

        DB_SERVER: 'localhost',
        DB_PORT: '1433',
        DB_NAME: 'NORA_Test',
        DB_USER: 'nora_test',
        DB_PASSWORD: 'test-password',

        DB_ENCRYPT: tls.encrypt,
        DB_TRUST_SERVER_CERTIFICATE: tls.trustServerCertificate,

        AUTH_USERNAME: 'test-user',
        AUTH_PASSWORD_HASH: '$argon2id$test',
        JWT_SECRET: 'test-secret-with-at-least-32-characters',
        JWT_EXPIRES_IN: '15m',

        CORS_ORIGINS: corsOrigins,
      },
    },
  );
}

test('allows secure database TLS configuration in production', () => {
  const result = loadProductionEnvironment({
    encrypt: 'true',
    trustServerCertificate: 'false',
  });

  assert.equal(result.status, 0, result.stderr);
});

test('rejects disabled database encryption in production', () => {
  const result = loadProductionEnvironment({
    encrypt: 'false',
    trustServerCertificate: 'false',
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /DB_ENCRYPT must be true in production/);
});

test('rejects trusted server certificates in production', () => {
  const result = loadProductionEnvironment({
    encrypt: 'true',
    trustServerCertificate: 'true',
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /DB_TRUST_SERVER_CERTIFICATE must be false in production/);
});

test('rejects HTTP CORS origins in production', () => {
  const result = loadProductionEnvironment(
    {
      encrypt: 'true',
      trustServerCertificate: 'false',
    },
    'http://example.com',
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CORS origin must use HTTPS in production/);
});
