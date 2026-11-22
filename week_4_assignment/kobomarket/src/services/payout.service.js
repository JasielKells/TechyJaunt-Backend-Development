const db = require('../config/db.pg');
const cfg = require('../config');
const { postTransaction } = require('./ledger.service');
const { getOrCreateUserWallet, getSystemAccount, lockAccountForUpdate } =
  require('../repositories/account.repo');
const { Errors } = require('../utils/errors');

async function requestPayout({ vendorId, amountKobo, idempotencyKey }) {
  if (amountKobo < cfg.payoutMinimumKobo) {
    throw Errors.badRequest(`Minimum payout is ${cfg.payoutMinimumKobo} kobo`);
  }
  try {
    return await db.transaction(async (trx) => {
      const wallet = await getOrCreateUserWallet(trx, vendorId, 'vendor');
      const locked = await lockAccountForUpdate(trx, wallet.id);
      if (locked.balance_kobo < amountKobo) {
        throw Errors.unprocessable('Insufficient balance');
      }

      // Unique partial index enforces "only one PENDING per vendor" — this
      // insert will fail on the second concurrent request.
      const [payout] = await trx('payouts').insert({
        vendor_id: vendorId,
        amount_kobo: amountKobo,
        status: 'PENDING',
        reference: `PO-${Date.now()}-${vendorId.slice(-6)}`,
        idempotency_key: idempotencyKey,
      }).returning('*');

      const clearing = await getSystemAccount(trx, 'PLATFORM_PAYOUT_CLEARING');
      await postTransaction({
        trx, type: 'PAYOUT_HOLD', reference: `PAYOUT-HOLD-${payout.id}`,
        metadata: { payoutId: payout.id, vendorId },
        entries: [
          { accountId: wallet.id,   direction: 'debit',  amountKobo },
          { accountId: clearing.id, direction: 'credit', amountKobo },
        ],
      });
      return payout;
    });
  } catch (e) {
    if (e.code === '23505' && String(e.detail || '').includes('uniq_pending_payout_per_vendor')) {
      throw Errors.conflict('A payout is already pending');
    }
    throw e;
  }
}
module.exports = { requestPayout };