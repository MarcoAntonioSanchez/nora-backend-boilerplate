import sql from 'mssql';

import { env } from './env.js';

/**
 * SQL Server connection pool configuration.
 *
 * Connection settings are loaded from the validated application environment.
 */
const databaseConfig = {
  user: env.database.user,
  password: env.database.password,
  server: env.database.server,
  port: env.database.port,
  database: env.database.name,
  options: {
    encrypt: env.database.options.encrypt,
    trustServerCertificate: env.database.options.trustServerCertificate,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

/**
 * Shared SQL Server connection pool.
 */
export const pool = new sql.ConnectionPool(databaseConfig);

/**
 * Establishes the SQL Server connection pool.
 *
 * @returns {Promise<sql.ConnectionPool>}
 */
export async function connectDatabase() {
  if (pool.connected) {
    return pool;
  }

  try {
    await pool.connect();

    return pool;
  } catch (error) {
    throw new Error('Failed to connect to SQL Server.', {
      cause: error,
    });
  }
}

/**
 * Closes the SQL Server connection pool.
 *
 * @returns {Promise<void>}
 */
export async function closeDatabase() {
  if (pool.connected || pool.connecting) {
    await pool.close();
  }
}

/**
 * Checks whether SQL Server is reachable and can execute queries.
 *
 * @returns {Promise<boolean>}
 */
export async function checkDatabase() {
  try {
    await pool.request().query('SELECT 1 AS health');

    return true;
  } catch {
    return false;
  }
}
