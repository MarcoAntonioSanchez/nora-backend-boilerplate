import { getHealthStatus } from '../services/health.service.js';

/**
 * Handles application health check requests.
 *
 * @param {import('fastify').FastifyRequest} _request
 * @param {import('fastify').FastifyReply} reply
 */
export async function getHealth(_request, reply) {
  const healthStatus = await getHealthStatus();

  if (healthStatus.database === 'unavailable') {
    return reply.code(503).send({
      status: 'error',
      ...healthStatus,
    });
  }

  return {
    status: 'ok',
    ...healthStatus,
  };
}
