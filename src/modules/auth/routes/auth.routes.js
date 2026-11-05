import { loginController } from '../controllers/auth.controller.js';

import { loginSchema } from '../auth.schema.js';

/**
 * Registers authentication routes.
 *
 * @param {import('fastify').FastifyInstance} app
 */
export default async function authRoutes(app) {
  app.post(
    '/auth/login',
    {
      schema: loginSchema,
    },
    loginController,
  );
}
