import { authenticateUser, generateAccessToken } from '../services/auth.service.js';

import { env } from '../../../config/env.js';

/**
 * Handles user authentication requests.
 *
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function loginController(request, reply) {
  const user = await authenticateUser(request.body);

  if (!user) {
    return reply.code(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid username or password.',
    });
  }

  const accessToken = generateAccessToken(user, request.server);

  return reply.code(200).send({
    status: 'success',
    data: {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: env.auth.jwtExpiresIn,
    },
  });
}
