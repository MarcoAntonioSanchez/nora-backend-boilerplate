/**
 * Processes user creation requests.
 *
 * Business rules and database persistence will be implemented
 * during Stage 06 - Integration.
 *
 * @param {{ name: string, email: string }} userData
 */
export async function createUser(userData) {
  return {
    message: 'User payload validated successfully.',
    data: userData,
  };
}
