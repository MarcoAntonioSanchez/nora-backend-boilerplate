/**
 * JSON Schema for creating a user.
 *
 * Fastify uses this schema to validate incoming request payloads.
 */
export const createUserSchema = {
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
};
