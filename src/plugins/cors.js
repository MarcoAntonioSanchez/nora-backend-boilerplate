import cors from '@fastify/cors';
import fp from 'fastify-plugin';

import { env } from '../config/env.js';

/**
 * Configures Cross-Origin Resource Sharing (CORS).
 *
 * Only explicitly configured frontend origins are allowed.
 */
async function corsPlugin(app) {
  await app.register(cors, {
    origin: env.cors.origins,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 86400,
  });
}

export default fp(corsPlugin);
