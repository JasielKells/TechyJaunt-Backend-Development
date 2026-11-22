class AppError extends Error {
  constructor(code, message, status = 400, details = null) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
const Errors = {
  badRequest: (m, d) => new AppError('BAD_REQUEST', m, 400, d),
  unauthorized: (m = 'Unauthorized') => new AppError('UNAUTHORIZED', m, 401),
  forbidden: (m = 'Forbidden') => new AppError('FORBIDDEN', m, 403),
  notFound: (m = 'Not found') => new AppError('NOT_FOUND', m, 404),
  conflict: (m, d) => new AppError('CONFLICT', m, 409, d),
  unprocessable: (m, d) => new AppError('UNPROCESSABLE', m, 422, d),
};
module.exports = { AppError, Errors };