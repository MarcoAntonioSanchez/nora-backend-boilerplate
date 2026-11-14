import { authenticateUser, generateAccessToken } from '../services/auth.service.js';

import { env } from '../../../config/env.js';

/**
 * Handles user authentication requests.
 *
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function loginController(request, reply) {
  const user = await authenticateUser(request.body, request.server.authDatabase);

  if (!user) {
    return reply.code(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid username or password.',
    });
  }

  const accessToken = generateAccessToken(user, request.server);

  const data = {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: env.auth.jwtExpiresIn,
  };

  if (user.accountType === 'user') {
    data.user = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    };
  }

  return reply.code(200).send({
    status: 'success',
    data,
  });
}
