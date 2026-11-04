import Fastify from 'fastify';

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

  return app;
}
