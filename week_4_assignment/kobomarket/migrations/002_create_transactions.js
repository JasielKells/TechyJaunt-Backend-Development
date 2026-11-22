exports.up = async (knex) => {
  await knex.schema.createTable('transactions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('reference').notNullable().unique();
    t.string('type').notNullable();    // FUNDING, ESCROW_HOLD, ESCROW_RELEASE, REFUND, PAYOUT, COMMISSION
    t.string('status').notNullable().defaultTo('completed');
    t.string('idempotency_key').unique();
    t.jsonb('metadata').defaultTo('{}');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
};
exports.down = (knex) => knex.schema.dropTable('transactions');