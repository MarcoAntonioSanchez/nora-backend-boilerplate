import { checkDatabase } from '../config/database.js';

/**
 * Registers application health check routes.
 *
 * @param {import('fastify').FastifyInstance} app
 */
export default async function healthRoutes(app) {
  app.get('/health', async (_request, reply) => {
    const databaseHealthy = await checkDatabase();

    if (!databaseHealthy) {
      return reply.code(503).send({
        status: 'error',
        database: 'unavailable',
      });
    }

    return {
      status: 'ok',
      database: 'connected',
    };
  });
}
