const db = require('../config/db.pg');
const { percent } = require('../utils/money');
const { postTransaction } = require('./ledger.service');
const { getOrCreateUserWallet, getSystemAccount } = require('../repositories/account.repo');
const { Errors } = require('../utils/errors');
const EventEmitter = require('../events/emitter');

async function openDispute({ subOrderId, buyerId, reason, evidence }) {
  return db.transaction(async (trx) => {
    const so = await trx('sub_orders').where({ id: subOrderId }).forUpdate().first();
    if (!so) throw Errors.notFound('Sub-order not found');
    if (so.status !== 'SHIPPED' && so.status !== 'DELIVERED') {
      throw Errors.conflict('Dispute only allowed on SHIPPED or DELIVERED');
    }
    // Verify buyer owns parent order
    const order = await trx('orders').where({ id: so.order_id }).first();
    if (order.buyer_id !== buyerId) throw Errors.forbidden();

    const [dispute] = await trx('disputes').insert({
      sub_order_id: subOrderId, buyer_id: buyerId, reason,
      evidence: evidence || [], status: 'OPEN',
    }).returning('*');
    await trx('sub_orders').where({ id: subOrderId }).update({ status: 'DISPUTED' });

    EventEmitter.emit('dispute.opened', { dispute });
    return dispute;
  });
}

async function resolveDispute({ disputeId, adminId, resolution, refundKobo, note }) {
  return db.transaction(async (trx) => {
    const d = await trx('disputes').where({ id: disputeId }).forUpdate().first();
    if (!d || d.status !== 'OPEN') throw Errors.conflict('Dispute not open');
    const so = await trx('sub_orders').where({ id: d.sub_order_id }).forUpdate().first();
    const order = await trx('orders').where({ id: so.order_id }).first();

    const escrow = await getSystemAccount(trx, 'PLATFORM_ESCROW');
    const revenue = await getSystemAccount(trx, 'PLATFORM_REVENUE');
    const buyerWallet = await getOrCreateUserWallet(trx, order.buyer_id, 'user');
    const vendorWallet = await getOrCreateUserWallet(trx, so.vendor_id, 'vendor');

    const gross = so.subtotal_kobo;
    const entries = [];

    if (resolution === 'FULL_REFUND') {
      // escrow → buyer (full), nothing to vendor, no commission
      entries.push(
        { accountId: escrow.id,       direction: 'debit',  amountKobo: gross },
        { accountId: buyerWallet.id,  direction: 'credit', amountKobo: gross },
      );
    } else if (resolution === 'PARTIAL_REFUND') {
      if (!refundKobo || refundKobo <= 0 || refundKobo >= gross) {
        throw Errors.badRequest('Invalid partial refund amount');
      }
      const vendorGross = gross - refundKobo;
      const commission = percent(vendorGross, Number(so.commission_kobo) / Number(gross));
      // Simplify: recompute commission at same rate on vendorGross.
      const vendorNet = vendorGross - commission;
      entries.push(
        { accountId: escrow.id,       direction: 'debit',  amountKobo: gross },
        { accountId: buyerWallet.id,  direction: 'credit', amountKobo: refundKobo },
        { accountId: vendorWallet.id, direction: 'credit', amountKobo: vendorNet },
        { accountId: revenue.id,      direction: 'credit', amountKobo: commission },
      );
    } else if (resolution === 'REJECTED') {
      const commission = so.commission_kobo;
      const vendorNet = gross - commission;
      entries.push(
        { accountId: escrow.id,        direction: 'debit',  amountKobo: gross },
        { accountId: vendorWallet.id,  direction: 'credit', amountKobo: vendorNet },
        { accountId: revenue.id,       direction: 'credit', amountKobo: commission },
      );
    } else {
      throw Errors.badRequest('Unknown resolution');
    }

    await postTransaction({
      trx, type: 'DISPUTE_RESOLUTION',
      reference: `DISPUTE-${disputeId}`,
      metadata: { disputeId, resolution, refundKobo },
      entries,
    });

    await trx('disputes').where({ id: disputeId }).update({
      status: 'RESOLVED', resolution, refund_kobo: refundKobo || null,
      resolved_by: adminId, resolution_note: note, resolved_at: new Date(),
    });
    await trx('sub_orders').where({ id: so.id }).update({
      status: resolution === 'REJECTED' ? 'COMPLETED' : 'CANCELLED',
    });

    EventEmitter.emit('dispute.resolved', { disputeId, resolution });
    return { ok: true };
  });
}
module.exports = { openDispute, resolveDispute };