exports.up = async (knex) => {
  await knex.schema.createTable('disputes', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('sub_order_id').references('id').inTable('sub_orders').onDelete('RESTRICT');
    t.string('buyer_id').notNullable();
    t.string('reason').notNullable();
    t.jsonb('evidence').defaultTo('[]');
    t.string('status').notNullable().defaultTo('OPEN'); // OPEN | RESOLVED
    t.string('resolution');                             // FULL_REFUND | PARTIAL_REFUND | REJECTED
    t.bigInteger('refund_kobo');
    t.string('resolved_by');
    t.text('resolution_note');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('resolved_at');
    t.index(['sub_order_id']);
    t.index(['status']);
  });
  await knex.raw(`
    CREATE UNIQUE INDEX uniq_open_dispute_per_suborder
    ON disputes (sub_order_id) WHERE status = 'OPEN'
  `);
};
exports.down = (knex) => knex.schema.dropTable('disputes');