/**
 * Authentication request validation schemas.
 */

/**
 * Login request body schema.
 */
export const loginSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    required: ['username', 'password'],
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 100,
      },
      password: {
        type: 'string',
        minLength: 1,
        maxLength: 128,
      },
    },
  },
};
