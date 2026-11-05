import argon2 from 'argon2';

import { env } from '../../../config/env.js';

/**
 * Authenticates the technical account.
 *
 * @param {{ username: string, password: string }} credentials
 * @returns {Promise<{ username: string, accountType: string } | null>}
 */
export async function authenticateUser(credentials) {
  const usernameMatches = credentials.username === env.auth.username;

  if (!usernameMatches) {
    return null;
  }

  const passwordMatches = await argon2.verify(env.auth.passwordHash, credentials.password);

  if (!passwordMatches) {
    return null;
  }

  return {
    username: env.auth.username,
    accountType: 'technical',
  };
}

/**
 * Generates a JWT for an authenticated technical account.
 *
 * @param {{ username: string, accountType: string }} user
 * @param {import('fastify').FastifyInstance} app
 * @returns {string}
 */
export function generateAccessToken(user, app) {
  return app.jwt.sign({
    sub: user.username,
    accountType: user.accountType,
  });
}
