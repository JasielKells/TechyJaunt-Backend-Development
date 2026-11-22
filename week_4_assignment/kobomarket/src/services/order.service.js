const db = require('../config/db.pg');
const cfg = require('../config');
const { percent } = require('../utils/money');
const { postTransaction } = require('./ledger.service');
const { getOrCreateUserWallet, getSystemAccount, lockAccountForUpdate } =
  require('../repositories/account.repo');
const Product = require('../models/Product');
const { Errors } = require('../utils/errors');
const EventEmitter = require('../events/emitter');

async function checkout({ buyerId, cartItems, idempotencyKey }) {
  // cartItems: [{ productId, quantity }]
  // 1. Load & validate products, group by vendor
  const productIds = cartItems.map((c) => c.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const vendorGroups = new Map();
  let totalKobo = 0;

  for (const item of cartItems) {
    const p = byId.get(item.productId);
    if (!p) throw Errors.badRequest(`Product ${item.productId} not found`);
    if (p.stock < item.quantity)
      throw Errors.conflict(`Insufficient stock for ${p.name}`);
    const line = p.priceKobo * item.quantity;
    totalKobo += line;
    const key = String(p.vendorId);
    if (!vendorGroups.has(key)) vendorGroups.set(key, { vendorId: key, items: [], subtotal: 0 });
    const g = vendorGroups.get(key);
    g.items.push({ productId: item.productId, quantity: item.quantity, unitPriceKobo: p.priceKobo });
    g.subtotal += line;
  }

  // 2. Postgres transaction: lock wallet, create order, escrow
  const result = await db.transaction(async (trx) => {
    const wallet = await getOrCreateUserWallet(trx, buyerId, 'user');
    const locked = await lockAccountForUpdate(trx, wallet.id);
    if (locked.balance_kobo < totalKobo) {
      throw Errors.unprocessable('Insufficient wallet balance');
    }
    const escrow = await getSystemAccount(trx, 'PLATFORM_ESCROW');

    const [order] = await trx('orders').insert({
      buyer_id: buyerId,
      total_kobo: totalKobo,
      status: 'PAID',
      idempotency_key: idempotencyKey,
    }).returning('*');

    const subOrders = [];
    for (const g of vendorGroups.values()) {
      const commission = percent(g.subtotal, cfg.commissionRate);
      const [so] = await trx('sub_orders').insert({
        order_id: order.id,
        vendor_id: g.vendorId,
        subtotal_kobo: g.subtotal,
        commission_kobo: commission,
        status: 'PAID',
      }).returning('*');
      subOrders.push(so);
      await trx('order_items').insert(g.items.map((i) => ({
        order_id: order.id, product_id: i.productId, vendor_id: g.vendorId,
        quantity: i.quantity, unit_price_kobo: i.unitPriceKobo,
      })));
    }

    await postTransaction({
      trx, type: 'ESCROW_HOLD',
      reference: `ESCROW-${order.id}`,
      metadata: { orderId: order.id, buyerId },
      entries: [
        { accountId: wallet.id, direction: 'debit', amountKobo: totalKobo },
        { accountId: escrow.id, direction: 'credit', amountKobo: totalKobo },
      ],
    });

    return { order, subOrders };
  });

  // 3. Decrement stock in Mongo (atomic). If ANY fails, compensate.
  try {
    for (const item of cartItems) {
      const res = await Product.updateOne(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (res.modifiedCount !== 1) {
        throw Errors.conflict(`Stock changed for ${item.productId}`);
      }
    }
  } catch (err) {
    // Compensate: reverse escrow, mark order CANCELLED
    await compensateCheckout(result.order.id, buyerId, totalKobo);
    throw err;
  }

  EventEmitter.emit('order.placed', { order: result.order, buyerId, subOrders: result.subOrders });
  return result;
}

async function compensateCheckout(orderId, buyerId, totalKobo) {
  await db.transaction(async (trx) => {
    const wallet = await getOrCreateUserWallet(trx, buyerId, 'user');
    const escrow = await getSystemAccount(trx, 'PLATFORM_ESCROW');
    await postTransaction({
      trx, type: 'ESCROW_RELEASE_REFUND',
      reference: `COMP-${orderId}`,
      metadata: { orderId, reason: 'stock_decrement_failed' },
      entries: [
        { accountId: escrow.id, direction: 'debit', amountKobo: totalKobo },
        { accountId: wallet.id, direction: 'credit', amountKobo: totalKobo },
      ],
    });
    await trx('orders').where({ id: orderId }).update({ status: 'CANCELLED' });
    await trx('sub_orders').where({ order_id: orderId }).update({ status: 'CANCELLED' });
  });
}

module.exports = { checkout, compensateCheckout };