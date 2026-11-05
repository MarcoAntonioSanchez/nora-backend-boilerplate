import { createUser as createUserService } from '../services/users.service.js';

/**
 * Handles user creation requests.
 *
 * @param {import('fastify').FastifyRequest} request
 */
export async function createUser(request) {
  return createUserService(request.body);
}
