import rateLimit from '@fastify/rate-limit';
import fp from 'fastify-plugin';

/**
 * Configures global API rate limiting.
 *
 * Limits each client to 100 requests per 15-minute window.
 */
async function rateLimitPlugin(app) {
  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '15 minutes',
  });
}

export default fp(rateLimitPlugin);
