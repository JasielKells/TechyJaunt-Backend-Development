exports.up = async (knex) => {
  await knex.schema.createTable('payouts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('vendor_id').notNullable();
    t.bigInteger('amount_kobo').notNullable();
    t.string('status').notNullable().defaultTo('PENDING'); // PENDING | SUCCESS | FAILED
    t.string('reference').unique();
    t.string('idempotency_key').unique();
    t.jsonb('failure_reason');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('processed_at');
    t.index(['vendor_id', 'status']);
  });
  // Enforce "cannot have more than one PENDING payout at a time" at DB level
  await knex.raw(`
    CREATE UNIQUE INDEX uniq_pending_payout_per_vendor
    ON payouts (vendor_id) WHERE status = 'PENDING'
  `);
};
exports.down = (knex) => knex.schema.dropTable('payouts');