import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

/**
 * Checks Swagger route registration in an isolated Node.js process.
 *
 * @param {'development' | 'production'} nodeEnv
 */
function getSwaggerRouteStatus(nodeEnv) {
  const script = `
    import { buildApp } from './src/app.js';

    const app = buildApp({
      connectToDatabase: async () => {},
    });

    try {
      await app.ready();

      console.log(JSON.stringify({
        documentation: app.hasRoute({
          method: 'GET',
          url: '/documentation/json',
        }),
      }));
    } finally {
      await app.close();
    }
  `;

  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    encoding: 'utf8',
    env: {
      NODE_ENV: nodeEnv,
      HOST: '127.0.0.1',
      PORT: '3000',
      DB_SERVER: 'localhost',
      DB_PORT: '1433',
      DB_NAME: 'NORA_Test',
      DB_USER: 'nora_test',
      DB_PASSWORD: 'test-password',
      DB_ENCRYPT: 'true',
      DB_TRUST_SERVER_CERTIFICATE: 'false',
      AUTH_USERNAME: 'test-user',
      AUTH_PASSWORD_HASH: '$argon2id$test',
      JWT_SECRET: 'test-secret-with-at-least-32-characters',
      JWT_EXPIRES_IN: '15m',
      CORS_ORIGINS: nodeEnv === 'production' ? 'https://example.com' : 'http://localhost:4321',
    },
  });

  assert.equal(result.status, 0, `Application subprocess failed:\n${result.stderr}`);

  return JSON.parse(result.stdout.trim());
}

/**
 * Checks client IP resolution with trusted and untrusted proxies.
 */
function getProxyAddressResults() {
  const script = `
    import { buildApp } from './src/app.js';

    const app = buildApp({
      connectToDatabase: async () => {},
    });

    app.get('/__test/client-ip', async (request) => ({
      ip: request.ip,
    }));

    try {
      await app.ready();

      const trustedProxy = await app.inject({
        method: 'GET',
        url: '/__test/client-ip',
        remoteAddress: '127.0.0.1',
        headers: {
          'x-forwarded-for': '198.51.100.25',
        },
      });

      const untrustedProxy = await app.inject({
        method: 'GET',
        url: '/__test/client-ip',
        remoteAddress: '192.0.2.10',
        headers: {
          'x-forwarded-for': '198.51.100.25',
        },
      });

      console.log(
        'NORA_PROXY_TEST_RESULT=' +
        JSON.stringify({
          trustedProxy: trustedProxy.json().ip,
          untrustedProxy: untrustedProxy.json().ip,
        }),
      );
    } finally {
      await app.close();
    }
  `;

  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    encoding: 'utf8',
    env: {
      NODE_ENV: 'test',
      HOST: '127.0.0.1',
      PORT: '3000',
      DB_SERVER: 'localhost',
      DB_PORT: '1433',
      DB_NAME: 'NORA_Test',
      DB_USER: 'nora_test',
      DB_PASSWORD: 'test-password',
      DB_ENCRYPT: 'true',
      DB_TRUST_SERVER_CERTIFICATE: 'false',
      AUTH_USERNAME: 'test-user',
      AUTH_PASSWORD_HASH: '$argon2id$test',
      JWT_SECRET: 'test-secret-with-at-least-32-characters',
      JWT_EXPIRES_IN: '15m',
      CORS_ORIGINS: 'http://localhost:4321',
    },
  });

  assert.equal(result.status, 0, `Application subprocess failed:\n${result.stderr}`);

  const outputLine = result.stdout
    .split(/\r?\n/)
    .find((line) => line.startsWith('NORA_PROXY_TEST_RESULT='));

  assert.ok(outputLine, `Proxy test result not found:\n${result.stdout}`);

  return JSON.parse(outputLine.slice('NORA_PROXY_TEST_RESULT='.length));
}

test('Swagger documentation is registered in development', () => {
  const result = getSwaggerRouteStatus('development');

  assert.equal(result.documentation, true);
});

test('Swagger documentation is disabled in production', () => {
  const result = getSwaggerRouteStatus('production');

  assert.equal(result.documentation, false);
});

test('Fastify trusts only the configured local proxy', () => {
  const result = getProxyAddressResults();

  assert.equal(result.trustedProxy, '198.51.100.25');
  assert.equal(result.untrustedProxy, '192.0.2.10');
});
