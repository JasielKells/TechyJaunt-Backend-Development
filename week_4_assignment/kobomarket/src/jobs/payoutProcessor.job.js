const cron = require('node-cron');
const db = require('../config/db.pg');
const { postTransaction } = require('../services/ledger.service');
const { getOrCreateUserWallet, getSystemAccount } = require('../repositories/account.repo');
const EventEmitter = require('../events/emitter');
const logger = require('../config/logger');

async function processOnePayout(payoutId) {
  return db.transaction(async (trx) => {
    const p = await trx('payouts').where({ id: payoutId }).forUpdate().first();
    if (!p || p.status !== 'PENDING') return { skipped: true };

    // Call Paystack Transfer (or mock) — out of scope of this snippet
    const succeeded = await mockTransfer(p);

    if (succeeded) {
      const clearing = await getSystemAccount(trx, 'PLATFORM_PAYOUT_CLEARING');
      const external = await getSystemAccount(trx, 'EXTERNAL_PAYOUTS');
      await postTransaction({
        trx, type: 'PAYOUT_SETTLE', reference: `PAYOUT-${p.id}`,
        metadata: { payoutId: p.id, vendorId: p.vendor_id },
        entries: [
          { accountId: clearing.id, direction: 'debit', amountKobo: p.amount_kobo },
          { accountId: external.id, direction: 'credit', amountKobo: p.amount_kobo },
        ],
      });
      await trx('payouts').where({ id: p.id })
        .update({ status: 'SUCCESS', processed_at: new Date() });
      EventEmitter.emit('payout.success', { payoutId: p.id, vendorId: p.vendor_id });
    } else {
      // Reverse: clearing → vendor wallet
      const clearing = await getSystemAccount(trx, 'PLATFORM_PAYOUT_CLEARING');
      const vendorWallet = await getOrCreateUserWallet(trx, p.vendor_id, 'vendor');
      await postTransaction({
        trx, type: 'PAYOUT_REVERSE', reference: `PAYOUT-FAIL-${p.id}`,
        metadata: { payoutId: p.id, vendorId: p.vendor_id },
        entries: [
          { accountId: clearing.id,      direction: 'debit',  amountKobo: p.amount_kobo },
          { accountId: vendorWallet.id,  direction: 'credit', amountKobo: p.amount_kobo },
        ],
      });
      await trx('payouts').where({ id: p.id })
        .update({ status: 'FAILED', processed_at: new Date(), failure_reason: { reason: 'mock' } });
      EventEmitter.emit('payout.failed', { payoutId: p.id, vendorId: p.vendor_id });
    }
    return { processed: true };
  });
}

async function mockTransfer() { return true; }

function startPayoutProcessor() {
  cron.schedule('*/2 * * * *', async () => {
    const pending = await db('payouts').where({ status: 'PENDING' }).limit(20);
    for (const p of pending) {
      try { await processOnePayout(p.id); }
      catch (e) { logger.error({ err: e, payoutId: p.id }, 'payout process failed'); }
    }
  });
}
module.exports = { startPayoutProcessor, processOnePayout };