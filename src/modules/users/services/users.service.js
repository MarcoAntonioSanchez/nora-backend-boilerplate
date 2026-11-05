import { usersRepository } from '../repositories/users.repository.js';

/**
 * Processes user creation requests.
 *
 * Persists the user record and handles business-level errors.
 *
 * @param {{ name: string, email: string }} userData
 * @returns {Promise<{ message: string, data: object }>}
 */
export async function createUser(userData) {
  try {
    const user = await usersRepository.createUserRecord(userData);

    return {
      message: 'User created successfully.',
      data: user,
    };
  } catch (error) {
    if (error.code === 'DUPLICATE_USER_EMAIL') {
      const conflictError = new Error(error.message);
      conflictError.statusCode = 409;

      throw conflictError;
    }

    throw error;
  }
}
