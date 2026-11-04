import { buildApp } from './app.js';
import { env } from './config/env.js';

/**
 * Starts the NORA HTTP server.
 */
async function startServer() {
  const app = buildApp();

  try {
    await app.listen({
      host: env.host,
      port: env.port,
    });
  } catch (error) {
    app.log.error(error, 'Failed to start NORA server');
    await app.close();
    process.exitCode = 1;
  }
}

startServer();
