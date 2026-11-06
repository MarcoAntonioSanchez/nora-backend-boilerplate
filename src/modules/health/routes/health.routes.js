import { getHealth } from '../controllers/health.controller.js';

/**
 * Registers application health check routes.
 *
 * @param {import('fastify').FastifyInstance} app
 */
export default async function healthRoutes(app) {
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Check application health.',
        description: 'Checks the application and SQL Server database availability.',
        response: {
          200: {
            description: 'Application and database are available.',
            type: 'object',
            properties: {
              status: { type: 'string', example: 'ok' },
              database: { type: 'string', enum: ['connected'] },
            },
            required: ['status', 'database'],
          },
          503: {
            description: 'Database is unavailable.',
            type: 'object',
            properties: {
              status: { type: 'string', example: 'error' },
              database: { type: 'string', enum: ['unavailable'] },
            },
            required: ['status', 'database'],
          },
        },
      },
    },
    getHealth,
  );
}
