const db = require('../config/db.pg');
const cfg = require('../config');
const { postTransaction } = require('./ledger.service');
const { getOrCreateUserWallet, getSystemAccount } = require('../repositories/account.repo');
const { assertTransition } = require('../utils/stateMachine');
const EventEmitter = require('../events/emitter');

async function completeSubOrder(subOrderId, { forced = false } = {}) {
  const result = await db.transaction(async (trx) => {
    const so = await trx('sub_orders').where({ id: subOrderId }).forUpdate().first();
    if (!so) throw new Error('Sub-order not found');

    // Dispute check for auto-complete
    if (forced === false) {
      const openDispute = await trx('disputes')
        .where({ sub_order_id: so.id, status: 'OPEN' }).first();
      if (openDispute) return { skipped: true, reason: 'dispute_open' };
    }

    if (so.status === 'DISPUTED' && !forced) return { skipped: true, reason: 'disputed' };
    assertTransition(so.status, 'COMPLETED');

    const escrow = await getSystemAccount(trx, 'PLATFORM_ESCROW');
    const revenue = await getSystemAccount(trx, 'PLATFORM_REVENUE');
    const vendorWallet = await getOrCreateUserWallet(trx, so.vendor_id, 'vendor');

    const grossKobo = so.subtotal_kobo;
    const commission = so.commission_kobo;
    const vendorPayout = grossKobo - commission;

    await postTransaction({
      trx, type: 'ESCROW_RELEASE',
      reference: `RELEASE-${so.id}`,
      metadata: { subOrderId: so.id, vendorId: so.vendor_id },
      entries: [
        { accountId: escrow.id,        direction: 'debit',  amountKobo: grossKobo },
        { accountId: vendorWallet.id,  direction: 'credit', amountKobo: vendorPayout },
        { accountId: revenue.id,       direction: 'credit', amountKobo: commission },
      ],
    });

    await trx('sub_orders').where({ id: so.id }).update({
      status: 'COMPLETED', completed_at: new Date(),
    });

    return { completed: true, subOrderId: so.id, vendorId: so.vendor_id, vendorPayout };
  });

  if (result.completed) {
    EventEmitter.emit('funds.released', result);
  }
  return result;
}

module.exports = { completeSubOrder };