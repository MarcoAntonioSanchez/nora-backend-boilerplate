import { createUser as createUserService } from '../services/users.service.js';

/**
 * Handles user creation requests.
 *
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function createUser(request, reply) {
  const result = await createUserService(request.body);

  return reply.code(201).send(result);
}
