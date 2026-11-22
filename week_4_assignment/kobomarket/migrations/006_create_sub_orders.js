exports.up = async (knex) => {
  await knex.schema.createTable('sub_orders', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
    t.string('vendor_id').notNullable();
    t.bigInteger('subtotal_kobo').notNullable();
    t.bigInteger('commission_kobo').notNullable();
    t.string('status').notNullable().defaultTo('PAID');
    // PENDING_PAYMENT | PAID | SHIPPED | DELIVERED | COMPLETED | CANCELLED | DISPUTED
    t.timestamp('shipped_at');
    t.timestamp('delivered_at');
    t.timestamp('completed_at');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index(['vendor_id']);
    t.index(['status']);
  });
};
exports.down = (knex) => knex.schema.dropTable('sub_orders');