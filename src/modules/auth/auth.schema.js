/**
 * Authentication request validation schemas.
 */

/**
 * Login request body schema.
 */
export const loginSchema = {
  tags: ['Authentication'],
  summary: 'Authenticate an account.',
  description:
    'Authenticates a technical account or an individual user account and returns a JWT access token.',

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

  response: {
    200: {
      description: 'Authentication successful.',
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            tokenType: { type: 'string', example: 'Bearer' },
            expiresIn: { type: 'string', example: '15m' },
            user: {
              type: 'object',
              description: 'Authenticated user profile. Only present for individual user accounts.',
              properties: {
                id: { type: 'integer', example: 1 },
                username: { type: 'string', example: 'raven.admin' },
                displayName: { type: 'string', example: 'Raven' },
                role: {
                  type: 'string',
                  enum: ['admin', 'patrouler'],
                  example: 'admin',
                },
              },
              required: ['id', 'username', 'displayName', 'role'],
            },
          },
          required: ['accessToken', 'tokenType', 'expiresIn'],
        },
      },
      required: ['status', 'data'],
    },

    401: {
      description: 'Invalid username or password.',
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 401 },
        error: { type: 'string', example: 'Unauthorized' },
        message: {
          type: 'string',
          example: 'Invalid username or password.',
        },
      },
      required: ['statusCode', 'error', 'message'],
    },
  },
};
