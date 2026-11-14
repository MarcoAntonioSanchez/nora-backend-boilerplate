import { createUser } from '../controllers/users.controller.js';
import { createUserSchema } from '../users.schema.js';

/**
 * Registers user management routes.
 *
 * @param {import('fastify').FastifyInstance} app
 */
export default async function usersRoutes(app) {
  app.post(
    '/users',
    {
      schema: createUserSchema,
      preHandler: [app.authenticate, app.authorize({ accountTypes: ['technical'] })],
    },
    createUser,
  );
}
