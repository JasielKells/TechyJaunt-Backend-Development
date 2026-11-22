exports.up = async (knex) => {
  await knex.schema.createTable('idempotency_keys', (t) => {
    t.string('key').primary();
    t.string('user_id').notNullable();
    t.string('route').notNullable();
    t.string('body_hash').notNullable();
    t.integer('status_code');
    t.jsonb('response');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
};
exports.down = (knex) => knex.schema.dropTable('idempotency_keys');