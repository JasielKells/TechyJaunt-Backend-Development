const crypto = require('crypto');
const db = require('../config/db.pg');
const { Errors } = require('../utils/errors');

function hashBody(body) {
  return crypto.createHash('sha256').update(JSON.stringify(body || {})).digest('hex');
}

module.exports = async function idempotency(req, res, next) {
  const key = req.headers['idempotency-key'];
  if (!key) return next(Errors.badRequest('Idempotency-Key header required'));
  const bodyHash = hashBody(req.body);
  const userId = req.user?.sub || 'anon';
  const route = `${req.method} ${req.baseUrl}${req.path}`;

  const existing = await db('idempotency_keys').where({ key }).first();
  if (existing) {
    if (existing.body_hash !== bodyHash || existing.route !== route) {
      return next(Errors.conflict('Idempotency-Key reused with different body'));
    }
    return res.status(existing.status_code).json(existing.response);
  }

  // hook res.json to persist result
  const originalJson = res.json.bind(res);
  res.json = async (payload) => {
    if (res.statusCode < 500) {
      await db('idempotency_keys').insert({
        key, user_id: userId, route, body_hash: bodyHash,
        status_code: res.statusCode, response: payload,
      }).onConflict('key').ignore();
    }
    return originalJson(payload);
  };
  next();
};