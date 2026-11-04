import Fastify from 'fastify';

import { closeDatabase, connectDatabase } from './config/database.js';

import healthRoutes from './routes/health.js';

/**
 * Creates and configures the NORA application.
 *
 * The Fastify instance is exported without starting the HTTP server.
 * This separation allows the application to be tested independently.
 *
 * @returns {import('fastify').FastifyInstance}
 */
export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // Establish the database connection before the application starts.
  app.addHook('onReady', async () => {
    await connectDatabase();
  });

  // Close the database connection when the application shuts down.
  app.addHook('onClose', closeDatabase);

  // Register application health check routes.
  app.register(healthRoutes);

  return app;
}
