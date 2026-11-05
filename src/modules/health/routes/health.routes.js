import { getHealth } from '../controllers/health.controller.js';

/**
 * Registers application health check routes.
 *
 * @param {import('fastify').FastifyInstance} app
 */
export default async function healthRoutes(app) {
  app.get('/health', getHealth);
}
