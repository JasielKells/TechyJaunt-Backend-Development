const logger = require('../config/logger');
module.exports = (err, req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) logger.error({ err, requestId: req.id }, 'unhandled');
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: status >= 500 ? 'Internal server error' : err.message,
      details: err.details || null,
    },
  });
};