/**
 * User management request validation schemas.
 */

/**
 * User creation request and response schemas.
 */
export const createUserSchema = {
  tags: ['Users'],
  summary: 'Create a user.',
  description: 'Creates a user record in Microsoft SQL Server. Requires a valid JWT.',

  security: [{ bearerAuth: [] }],

  body: {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'email'],
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 254,
      },
    },
  },

  response: {
    201: {
      description: 'User created successfully.',
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User created successfully.',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            created_at: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'name', 'email', 'created_at'],
        },
      },
      required: ['message', 'data'],
    },

    400: {
      description: 'Invalid request body.',
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 400 },
        error: { type: 'string', example: 'Bad Request' },
        message: { type: 'string' },
      },
      required: ['statusCode', 'error', 'message'],
    },

    401: {
      description: 'Missing or invalid authentication token.',
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 401 },
        error: { type: 'string', example: 'Unauthorized' },
        message: { type: 'string' },
      },
      required: ['statusCode', 'error', 'message'],
    },

    409: {
      description: 'A user with this email already exists.',
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 409 },
        error: { type: 'string', example: 'Conflict' },
        message: {
          type: 'string',
          example: 'A user with this email already exists.',
        },
      },
      required: ['statusCode', 'error', 'message'],
    },
  },
};
