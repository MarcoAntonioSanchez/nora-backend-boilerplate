import jwt from '@fastify/jwt';
import fp from 'fastify-plugin';

import { env } from '../config/env.js';

/**
 * Registers JWT authentication and authorization support.
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

  // Restrict access according to account types and roles.
  app.decorate('authorize', function ({ accountTypes, roles } = {}) {
    return async function (request, reply) {
      const accountTypeAllowed = !accountTypes || accountTypes.includes(request.user.accountType);

      const roleAllowed = !roles || roles.includes(request.user.role);

      if (!accountTypeAllowed || !roleAllowed) {
        return reply.code(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You are not authorized to access this resource.',
        });
      }
    };
  });
}

export default fp(authenticationPlugin);
