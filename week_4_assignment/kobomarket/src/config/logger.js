const pino = require('pino');
const cfg = require('./index');
module.exports = pino({
  level: cfg.env === 'test' ? 'silent' : 'info',
  redact: ['req.headers.authorization', 'req.body.password', 'req.headers.cookie'],
});