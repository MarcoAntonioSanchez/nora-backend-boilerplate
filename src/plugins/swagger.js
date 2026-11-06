import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import fp from 'fastify-plugin';

/**
 * Registers OpenAPI documentation and Swagger UI.
 *
 * @param {import('fastify').FastifyInstance} app
 */
async function swaggerPlugin(app) {
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'NORA Backend API',
        description: 'Modular REST API powered by Node.js, Fastify and Microsoft SQL Server.',
        version: '0.1.0',
      },
      tags: [
        { name: 'Health', description: 'Application health checks.' },
        { name: 'Authentication', description: 'Technical account authentication.' },
        { name: 'Users', description: 'User management operations.' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await app.register(swaggerUI, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });
}

export default fp(swaggerPlugin);
