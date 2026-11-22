const knex = require('knex');
const cfg = require('./index');
const db = knex({
  client: 'pg',
  connection: cfg.pg,
  pool: { min: 2, max: 10 },
});
module.exports = db;