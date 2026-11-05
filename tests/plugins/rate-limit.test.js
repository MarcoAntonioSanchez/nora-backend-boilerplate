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
});

// Import application modules after configuring the test environment.
const [{ default: rateLimitPlugin }, { default: authRoutes }] = await Promise.all([
  import('../../src/plugins/rate-limit.js'),
  import('../../src/modules/auth/routes/auth.routes.js'),
]);

// Build an isolated application for global rate limiting.
const globalApp = Fastify({
  logger: false,
});

await globalApp.register(rateLimitPlugin);

globalApp.get('/rate-limit-check', async () => ({
  status: 'ok',
}));

await globalApp.ready();

// Build an isolated application for login rate limiting.
const loginApp = Fastify({
  logger: false,
});

await loginApp.register(rateLimitPlugin);
await loginApp.register(authRoutes);
await loginApp.ready();

// Close test applications after all tests finish.
after(async () => {
  await Promise.all([globalApp.close(), loginApp.close()]);
});

// Global rate limiting.
test('blocks requests after exceeding the global rate limit', async () => {
  let response;

  for (let attempt = 0; attempt < 101; attempt += 1) {
    response = await globalApp.inject({
      method: 'GET',
      url: '/rate-limit-check',
    });
  }

  assert.equal(response.statusCode, 429);
});

// Login rate limiting.
test('blocks login attempts after exceeding the route rate limit', async () => {
  let response;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    response = await loginApp.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: 'invalid-user',
        password: 'invalid-password',
      },
    });
  }

  assert.equal(response.statusCode, 429);
});
