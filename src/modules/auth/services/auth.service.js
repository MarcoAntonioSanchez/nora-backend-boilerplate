import argon2 from 'argon2';

import { env } from '../../../config/env.js';
import { pool } from '../../../config/database.js';

/**
 * Authenticates a technical account or an individual user account.
 *
 * Technical account authentication retains its existing mechanism.
 * Individual accounts are retrieved from dbo.auth_users.
 *
 * @param {{ username: string, password: string }} credentials
 * @param {import('mssql').ConnectionPool} [database=pool] Database connection pool.
 * @returns {Promise<{
 *   id?: number,
 *   username: string,
 *   displayName?: string,
 *   role?: string,
 *   accountType: string
 * } | null>}
 */
export async function authenticateUser(credentials, database = pool) {
  // Preserve the existing technical account authentication.
  const usernameMatches = credentials.username === env.auth.username;

  if (usernameMatches) {
    const passwordMatches = await argon2.verify(env.auth.passwordHash, credentials.password);

    if (!passwordMatches) {
      return null;
    }

    return {
      username: env.auth.username,
      accountType: 'technical',
    };
  }

  // Normalize individual usernames before querying SQL Server.
  const username = credentials.username.toLowerCase();

  const result = await database.request().input('username', username).query(`
      SELECT
        id,
        username,
        display_name AS displayName,
        password_hash AS passwordHash,
        role,
        is_active AS isActive
      FROM dbo.auth_users
      WHERE username = @username;
    `);

  const user = result.recordset[0];

  if (!user || !user.isActive) {
    return null;
  }

  const passwordMatches = await argon2.verify(user.passwordHash, credentials.password);

  if (!passwordMatches) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    accountType: 'user',
  };
}

/**
 * Generates a JWT for an authenticated account.
 *
 * Technical accounts retain their existing token claims.
 * Individual user accounts receive their database identity and role.
 *
 * @param {{
 *   id?: number,
 *   username: string,
 *   displayName?: string,
 *   role?: string,
 *   accountType: string
 * }} user
 * @param {import('fastify').FastifyInstance} app
 * @returns {string}
 */
export function generateAccessToken(user, app) {
  if (user.accountType === 'technical') {
    return app.jwt.sign({
      sub: user.username,
      accountType: user.accountType,
    });
  }

  return app.jwt.sign({
    sub: String(user.id),
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    accountType: user.accountType,
  });
}
