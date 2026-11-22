exports.up = async (knex) => {
  await knex.schema.createTable('orders', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('buyer_id').notNullable();            // mongo user _id
    t.bigInteger('total_kobo').notNullable();
    t.string('status').notNullable().defaultTo('PAID');
    t.string('idempotency_key').unique();
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
};
exports.down = (knex) => knex.schema.dropTable('orders');