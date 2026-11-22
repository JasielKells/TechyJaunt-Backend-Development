exports.up = async (knex) => {
  await knex.raw(`CREATE TYPE entry_direction AS ENUM ('debit','credit')`);
  await knex.schema.createTable('ledger_entries', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('transaction_id').notNullable()
      .references('id').inTable('transactions').onDelete('RESTRICT');
    t.uuid('account_id').notNullable()
      .references('id').inTable('accounts').onDelete('RESTRICT');
    t.specificType('direction', 'entry_direction').notNullable();
    t.bigInteger('amount_kobo').notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index(['account_id']);
    t.index(['transaction_id']);
  });
  await knex.raw(`ALTER TABLE ledger_entries ADD CONSTRAINT chk_amount_positive CHECK (amount_kobo > 0)`);

  // Append-only guard: reject UPDATE/DELETE at the DB level
  await knex.raw(`
    CREATE OR REPLACE FUNCTION forbid_ledger_modification() RETURNS trigger AS $$
    BEGIN
      RAISE EXCEPTION 'ledger_entries is append-only';
    END; $$ LANGUAGE plpgsql;
  `);
  await knex.raw(`
    CREATE TRIGGER trg_ledger_immutable
    BEFORE UPDATE OR DELETE ON ledger_entries
    FOR EACH ROW EXECUTE FUNCTION forbid_ledger_modification();
  `);
};
exports.down = async (knex) => {
  await knex.raw(`DROP TRIGGER IF EXISTS trg_ledger_immutable ON ledger_entries`);
  await knex.raw(`DROP FUNCTION IF EXISTS forbid_ledger_modification`);
  await knex.schema.dropTable('ledger_entries');
  await knex.raw(`DROP TYPE entry_direction`);
};