const jwt = require('jsonwebtoken');
const cfg = require('../config');
const { Errors } = require('../utils/errors');

function authenticate(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return next(Errors.unauthorized());
  try {
    req.user = jwt.verify(token, cfg.jwt.accessSecret);
    next();
  } catch { next(Errors.unauthorized('Invalid/expired token')); }
}
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return next(Errors.unauthorized());
    if (!roles.includes(req.user.role)) return next(Errors.forbidden());
    next();
  };
}
module.exports = { authenticate, requireRole };