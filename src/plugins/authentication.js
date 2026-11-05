import jwt from '@fastify/jwt';
import fp from 'fastify-plugin';

import { env } from '../config/env.js';

/**
 * Registers JWT authentication support.
 *
 * @param {import('fastify').FastifyInstance} app
 */
async function authenticationPlugin(app) {
  // Register JWT support.
  await app.register(jwt, {
    secret: env.auth.jwtSecret,
    sign: {
      expiresIn: env.auth.jwtExpiresIn,
    },
  });

  // Protect routes by verifying the JWT in the Authorization header.
  app.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication required or token is invalid.',
      });
    }
  });
}

export default fp(authenticationPlugin);
