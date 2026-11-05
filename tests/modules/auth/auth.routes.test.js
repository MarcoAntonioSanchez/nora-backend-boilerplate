import assert from 'node:assert/strict';
import { after, test } from 'node:test';

import argon2 from 'argon2';
import Fastify from 'fastify';

// Configure isolated test credentials.
const testPassword = 'NORA-test-password';
const testPasswordHash = await argon2.hash(testPassword);

Object.assign(process.env, {
  NODE_ENV: 'test',
  DB_SERVER: 'localhost',
  DB_NAME: 'NORA_Test',
  DB_USER: 'nora_test',
  DB_PASSWORD: 'test-only-password',
  AUTH_USERNAME: 'nora-test',
  AUTH_PASSWORD_HASH: testPasswordHash,
  JWT_SECRET: 'nora-test-jwt-secret-with-more-than-32-characters',
});

// Import application modules after configuring the test environment.
const [{ default: authenticationPlugin }, { default: authRoutes }, { default: usersRoutes }] =
  await Promise.all([
    import('../../../src/plugins/authentication.js'),
    import('../../../src/modules/auth/routes/auth.routes.js'),
    import('../../../src/modules/users/routes/users.routes.js'),
  ]);

// Build an isolated Fastify application without a database connection.
const app = Fastify({
  logger: false,
});

await app.register(authenticationPlugin);
await app.register(authRoutes);
await app.register(usersRoutes);
await app.ready();

// Close the test application after all tests finish.
after(async () => {
  await app.close();
});

// Valid login.
test('authenticates through the HTTP login endpoint', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      username: 'nora-test',
      password: testPassword,
    },
  });

  assert.equal(response.statusCode, 200);

  const body = response.json();

  assert.equal(body.status, 'success');
  assert.equal(body.data.tokenType, 'Bearer');
  assert.equal(body.data.expiresIn, '15m');
  assert.equal(typeof body.data.accessToken, 'string');
});

// Invalid login.
test('rejects invalid credentials through the HTTP login endpoint', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      username: 'nora-test',
      password: 'wrong-password',
    },
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.json().message, 'Invalid username or password.');
});

// Missing authentication.
test('rejects requests without an access token', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/users',
    payload: {
      name: 'Test User',
      email: 'test@example.com',
    },
  });

  assert.equal(response.statusCode, 401);
});

// Invalid authentication.
test('rejects requests with an invalid access token', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/users',
    headers: {
      authorization: 'Bearer invalid.jwt.token',
    },
    payload: {
      name: 'Test User',
      email: 'test@example.com',
    },
  });

  assert.equal(response.statusCode, 401);
});

// Valid authentication.
test('allows requests with a valid access token', async () => {
  const accessToken = app.jwt.sign({
    sub: 'nora-test',
    accountType: 'technical',
  });

  const response = await app.inject({
    method: 'POST',
    url: '/users',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    payload: {
      name: 'Test User',
      email: 'test@example.com',
    },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json().data, {
    name: 'Test User',
    email: 'test@example.com',
  });
});
