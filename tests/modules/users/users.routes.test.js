import assert from 'node:assert/strict';
import { after, mock, test } from 'node:test';

import Fastify from 'fastify';
import argon2 from 'argon2';

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
const [{ default: authenticationPlugin }, { default: usersRoutes }, { usersRepository }] =
  await Promise.all([
    import('../../../src/plugins/authentication.js'),
    import('../../../src/modules/users/routes/users.routes.js'),
    import('../../../src/modules/users/repositories/users.repository.js'),
  ]);

// Build an isolated Fastify application without a database connection.
const app = Fastify({
  logger: false,
});

await app.register(authenticationPlugin);
await app.register(usersRoutes);
await app.ready();

// Generate a valid access token for protected endpoints.
const accessToken = app.jwt.sign({
  sub: 'nora-test',
  accountType: 'technical',
});

// Generate valid access tokens for individual user accounts.
const adminAccessToken = app.jwt.sign({
  sub: '1',
  username: 'raven.admin',
  displayName: 'Raven',
  role: 'admin',
  accountType: 'user',
});

const patroulerAccessToken = app.jwt.sign({
  sub: '2',
  username: 'raven.patrouler',
  displayName: 'Patrouler',
  role: 'patrouler',
  accountType: 'user',
});

// Mock repository responses to avoid database dependencies.
mock.method(usersRepository, 'createUserRecord', async (userData) => {
  if (userData.email === 'duplicate@example.com') {
    const error = new Error('A user with this email already exists.');
    error.code = 'DUPLICATE_USER_EMAIL';

    throw error;
  }

  return {
    id: 1,
    name: userData.name,
    email: userData.email,
    created_at: new Date('2026-11-05T12:00:00.000Z'),
  };
});

// Close the test application after all tests finish.
after(async () => {
  await app.close();
});

// Reject requests without authentication.
test('rejects user creation without an access token', async () => {
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

// Reject invalid request payloads.
test('rejects invalid user creation payloads', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/users',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    payload: {
      name: 'A',
      email: 'invalid-email',
    },
  });

  assert.equal(response.statusCode, 400);
});

// Create a user successfully.
test('creates a user through the HTTP endpoint', async () => {
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

  assert.equal(response.statusCode, 201);

  assert.deepEqual(response.json(), {
    message: 'User created successfully.',
    data: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      created_at: '2026-11-05T12:00:00.000Z',
    },
  });
});

// Reject user creation when the email already exists.
test('rejects user creation with a duplicate email', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/users',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    payload: {
      name: 'Another User',
      email: 'duplicate@example.com',
    },
  });

  assert.equal(response.statusCode, 409);

  assert.equal(response.json().message, 'A user with this email already exists.');
});

// Reject user creation for admin accounts.
test('rejects user creation from an admin account', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/users',
    headers: {
      authorization: `Bearer ${adminAccessToken}`,
    },
    payload: {
      name: 'Test User',
      email: 'admin-test@example.com',
    },
  });

  assert.equal(response.statusCode, 403);
});

// Reject user creation for patrouler accounts.
test('rejects user creation from a patrouler account', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/users',
    headers: {
      authorization: `Bearer ${patroulerAccessToken}`,
    },
    payload: {
      name: 'Test User',
      email: 'patrouler-test@example.com',
    },
  });

  assert.equal(response.statusCode, 403);
});
