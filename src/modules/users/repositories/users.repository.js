import { pool } from '../../../config/database.js';

/**
 * Creates a user record in SQL Server.
 *
 * Uses parameterized SQL queries to prevent SQL injection.
 *
 * @param {{ name: string, email: string }} userData
 * @returns {Promise<{ id: number, name: string, email: string, created_at: Date }>}
 */
export const usersRepository = {
  async createUserRecord(userData) {
    try {
      const result = await pool
        .request()
        .input('name', userData.name)
        .input('email', userData.email).query(`
        INSERT INTO dbo.users (name, email)
        OUTPUT
          INSERTED.id,
          INSERTED.name,
          INSERTED.email,
          INSERTED.created_at
        VALUES (@name, @email);
      `);

      return result.recordset[0];
    } catch (error) {
      // SQL Server duplicate key errors.
      if (error.number === 2601 || error.number === 2627) {
        const duplicateError = new Error('A user with this email already exists.');
        duplicateError.code = 'DUPLICATE_USER_EMAIL';

        throw duplicateError;
      }

      throw error;
    }
  },
};
