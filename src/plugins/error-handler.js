/**
 * Registers the global application error handler.
 *
 * Client errors return their original HTTP status and message.
 * Internal server errors return a generic message to avoid
 * exposing sensitive implementation details.
 *
 * @param {import('fastify').FastifyInstance} app
 */
export function registerErrorHandler(app) {
  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode >= 400 && error.statusCode < 500 ? error.statusCode : 500;

    request.log.error(
      {
        err: error,
        statusCode,
      },
      'Request failed.',
    );

    return reply.code(statusCode).send({
      statusCode,
      error:
        statusCode >= 500
          ? 'Internal Server Error'
          : statusCode === 400
            ? 'Bad Request'
            : statusCode === 401
              ? 'Unauthorized'
              : statusCode === 403
                ? 'Forbidden'
                : statusCode === 404
                  ? 'Not Found'
                  : 'Client Error',
      message: statusCode >= 500 ? 'An unexpected error occurred.' : error.message,
    });
  });
}
