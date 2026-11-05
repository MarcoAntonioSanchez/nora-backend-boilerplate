import Fastify from 'fastify';

import { closeDatabase, connectDatabase } from './config/database.js';

import { registerErrorHandler } from './plugins/error-handler.js';

import authenticationPlugin from './plugins/authentication.js';

import healthRoutes from './modules/health/routes/health.routes.js';

import usersRoutes from './modules/users/routes/users.routes.js';

import authRoutes from './modules/auth/routes/auth.routes.js';

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
    ajv: {
      customOptions: {
        removeAdditional: false,
      },
    },
  });
  // Register the global application error handler.
  registerErrorHandler(app);

  // Register JWT authentication support.
  app.register(authenticationPlugin);

  // Establish the database connection before the application starts.
  app.addHook('onReady', async () => {
    await connectDatabase();
  });

  // Close the database connection when the application shuts down.
  app.addHook('onClose', closeDatabase);

  // Register application health check routes.
  app.register(healthRoutes);

  // Register user management routes.
  app.register(usersRoutes);

  // Register authentication routes.
  app.register(authRoutes);

  return app;
}
