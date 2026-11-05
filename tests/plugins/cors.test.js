import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import Fastify from 'fastify';

// Configure isolated test environment variables.
Object.assign(process.env, {
  NODE_ENV: 'test',
  DB_SERVER: 'localhost',
  DB_NAME: 'NORA_Test',
  DB_USER: 'nora_test',
  DB_PASSWORD: 'test-only-password',
  AUTH_USERNAME: 'nora-test',
  AUTH_PASSWORD_HASH: '$argon2id$test',
  JWT_SECRET: 'nora-test-jwt-secret-with-more-than-32-characters',
  CORS_ORIGINS: 'http://localhost:4321',
});

// Import the CORS plugin after configuring the test environment.
const { default: corsPlugin } = await import('../../src/plugins/cors.js');

// Build an isolated Fastify application.
const app = Fastify({
  logger: false,
});

await app.register(corsPlugin);

// Register a test endpoint.
app.get('/cors-check', async () => ({
  status: 'ok',
}));

await app.ready();

// Close the test application after all tests finish.
after(async () => {
  await app.close();
});

// Allowed origin.
test('allows requests from configured origins', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/cors-check',
    headers: {
      origin: 'http://localhost:4321',
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:4321');
});

// Disallowed origin.
test('does not allow requests from unconfigured origins', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/cors-check',
    headers: {
      origin: 'http://localhost:5000',
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['access-control-allow-origin'], undefined);
});

// Preflight request.
test('handles CORS preflight requests correctly', async () => {
  const response = await app.inject({
    method: 'OPTIONS',
    url: '/cors-check',
    headers: {
      origin: 'http://localhost:4321',
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type,authorization',
    },
  });

  assert.equal(response.statusCode, 204);
  assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:4321');

  assert.match(response.headers['access-control-allow-methods'], /POST/);
  assert.match(response.headers['access-control-allow-headers'], /authorization/i);
  assert.match(response.headers['access-control-allow-headers'], /content-type/i);
});
