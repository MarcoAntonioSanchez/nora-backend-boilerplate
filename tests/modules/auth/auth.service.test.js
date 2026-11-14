import assert from 'node:assert/strict';
import { test } from 'node:test';

import argon2 from 'argon2';

// Configure isolated test environment variables.
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

// Import the service after configuring the test environment.
const { authenticateUser, generateAccessToken } =
  await import('../../../src/modules/auth/services/auth.service.js');

// Valid credentials.
test('authenticates a user with valid credentials', async () => {
  const user = await authenticateUser({
    username: 'nora-test',
    password: testPassword,
  });

  assert.deepEqual(user, {
    username: 'nora-test',
    accountType: 'technical',
  });
});

// Invalid username.
test('rejects an invalid username', async () => {
  const mockDatabase = {
    request() {
      return {
        input() {
          return this;
        },
        async query() {
          return {
            recordset: [],
          };
        },
      };
    },
  };

  const user = await authenticateUser(
    {
      username: 'invalid-user',
      password: testPassword,
    },
    mockDatabase,
  );

  assert.equal(user, null);
});

// Invalid password.
test('rejects an invalid password', async () => {
  const user = await authenticateUser({
    username: 'nora-test',
    password: 'wrong-password',
  });

  assert.equal(user, null);
});

// Access token generation.
test('generates an access token with the expected user claims', () => {
  let receivedPayload;

  const mockApp = {
    jwt: {
      sign(payload) {
        receivedPayload = payload;
        return 'mock-access-token';
      },
    },
  };

  const token = generateAccessToken(
    {
      username: 'nora-test',
      accountType: 'technical',
    },
    mockApp,
  );

  assert.equal(token, 'mock-access-token');

  assert.deepEqual(receivedPayload, {
    sub: 'nora-test',
    accountType: 'technical',
  });
});

// Individual user account authentication.
test('authenticates an active admin account with valid credentials', async () => {
  const userPassword = 'NORA-admin-test-password';
  const userPasswordHash = await argon2.hash(userPassword);

  const mockDatabase = {
    request() {
      return {
        input() {
          return this;
        },
        async query() {
          return {
            recordset: [
              {
                id: 1,
                username: 'raven.admin',
                displayName: 'Raven',
                passwordHash: userPasswordHash,
                role: 'admin',
                isActive: true,
              },
            ],
          };
        },
      };
    },
  };

  const user = await authenticateUser(
    {
      username: 'RAVEN.ADMIN',
      password: userPassword,
    },
    mockDatabase,
  );

  assert.deepEqual(user, {
    id: 1,
    username: 'raven.admin',
    displayName: 'Raven',
    role: 'admin',
    accountType: 'user',
  });
});

// Rejects an individual user account with an invalid password.
test('rejects an individual user account with an invalid password', async () => {
  const userPasswordHash = await argon2.hash('NORA-admin-test-password');

  const mockDatabase = {
    request() {
      return {
        input() {
          return this;
        },
        async query() {
          return {
            recordset: [
              {
                id: 1,
                username: 'raven.admin',
                displayName: 'Raven',
                passwordHash: userPasswordHash,
                role: 'admin',
                isActive: true,
              },
            ],
          };
        },
      };
    },
  };

  const user = await authenticateUser(
    {
      username: 'raven.admin',
      password: 'wrong-password',
    },
    mockDatabase,
  );

  assert.equal(user, null);
});

// Rejects an inactive individual user account.
test('rejects an inactive individual user account', async () => {
  const userPassword = 'NORA-admin-test-password';
  const userPasswordHash = await argon2.hash(userPassword);

  const mockDatabase = {
    request() {
      return {
        input() {
          return this;
        },
        async query() {
          return {
            recordset: [
              {
                id: 1,
                username: 'raven.admin',
                displayName: 'Raven',
                passwordHash: userPasswordHash,
                role: 'admin',
                isActive: false,
              },
            ],
          };
        },
      };
    },
  };

  const user = await authenticateUser(
    {
      username: 'raven.admin',
      password: userPassword,
    },
    mockDatabase,
  );

  assert.equal(user, null);
});

// Individual user access token generation.
test('generates an access token with the expected individual user claims', () => {
  let receivedPayload;

  const mockApp = {
    jwt: {
      sign(payload) {
        receivedPayload = payload;
        return 'mock-user-access-token';
      },
    },
  };

  const token = generateAccessToken(
    {
      id: 1,
      username: 'raven.admin',
      displayName: 'Raven',
      role: 'admin',
      accountType: 'user',
    },
    mockApp,
  );

  assert.equal(token, 'mock-user-access-token');

  assert.deepEqual(receivedPayload, {
    sub: '1',
    username: 'raven.admin',
    displayName: 'Raven',
    role: 'admin',
    accountType: 'user',
  });
});
