import { checkDatabase } from '../../../config/database.js';

/**
 * Checks the availability of the database.
 *
 * @returns {Promise<boolean>}
 */
export async function getDatabaseHealth() {
  return checkDatabase();
}
