import { getDatabaseHealth } from '../repositories/health.repository.js';

/**
 * Retrieves the health status of the database.
 *
 * @returns {Promise<{ database: 'connected' | 'unavailable' }>}
 */
export async function getHealthStatus() {
  const databaseHealthy = await getDatabaseHealth();

  return {
    database: databaseHealthy ? 'connected' : 'unavailable',
  };
}
