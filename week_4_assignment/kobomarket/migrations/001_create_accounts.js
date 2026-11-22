exports.up = async (knex) => {
  await knex.raw(`CREATE TYPE owner_type AS ENUM ('user','vendor','system')`);
  await knex.schema.createTable('accounts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.specificType('owner_type', 'owner_type').notNullable();
    t.string('owner_id').notNullable();           // mongo _id or system name
    t.string('currency').notNullable().defaultTo('NGN');
    t.bigInteger('balance_kobo').notNullable().defaultTo(0);
    t.string('status').notNullable().defaultTo('active');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.unique(['owner_type', 'owner_id', 'currency']);
  });
  // CHECK: user wallets cannot go negative (system accounts may, conceptually, but ours won't)
  await knex.raw(`
    ALTER TABLE accounts ADD CONSTRAINT chk_balance_nonneg
    CHECK (owner_type = 'system' OR balance_kobo >= 0)`);
};
exports.down = async (knex) => {
  await knex.schema.dropTable('accounts');
  await knex.raw(`DROP TYPE owner_type`);
};