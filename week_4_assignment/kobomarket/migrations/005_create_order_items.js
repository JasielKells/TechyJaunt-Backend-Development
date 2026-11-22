exports.up = async (knex) => {
  await knex.schema.createTable('order_items', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
    t.string('product_id').notNullable();          // mongo product _id
    t.string('vendor_id').notNullable();
    t.integer('quantity').notNullable();
    t.bigInteger('unit_price_kobo').notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
};
exports.down = (knex) => knex.schema.dropTable('order_items');