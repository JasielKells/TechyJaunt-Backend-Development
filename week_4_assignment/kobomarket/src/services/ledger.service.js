const db = require('../config/db.pg');
const { assertIntKobo } = require('../utils/money');
const { v4: uuid } = require('uuid');

/**
 * Post a balanced transaction.
 * entries: [{ accountId, direction: 'debit'|'credit', amountKobo }]
 * Rules:
 *  - sum(credit) === sum(debit)
 *  - every amountKobo > 0
 *  - updates accounts.balance_kobo atomically (credit adds, debit subtracts)
 *  - inserts one ledger_entry per entry
 *  - accepts an existing trx to participate in caller's transaction
 */
async function postTransaction({
  trx,
  type,
  reference,
  idempotencyKey = null,
  metadata = {},
  entries,
}) {
  const run = async (t) => {
    // 1. Validate balance
    let debit = 0n, credit = 0n;
    for (const e of entries) {
      assertIntKobo(e.amountKobo);
      if (e.direction === 'debit') debit += BigInt(e.amountKobo);
      else if (e.direction === 'credit') credit += BigInt(e.amountKobo);
      else throw new Error('direction must be debit|credit');
    }
    if (debit !== credit) {
      throw new Error(`Unbalanced transaction: debit=${debit} credit=${credit}`);
    }

    // 2. Insert transaction row
    const [tx] = await t('transactions')
      .insert({
        reference: reference || uuid(),
        type,
        status: 'completed',
        idempotency_key: idempotencyKey,
        metadata,
      })
      .returning('*');

    // 3. Lock all involved accounts (deterministic order to avoid deadlocks)
    const accountIds = [...new Set(entries.map((e) => e.accountId))].sort();
    const locked = {};
    for (const id of accountIds) {
      locked[id] = await t('accounts').where({ id }).forUpdate().first();
      if (!locked[id]) throw new Error(`Account ${id} not found`);
    }

    // 4. Apply deltas + insert ledger entries
    for (const e of entries) {
      const delta = e.direction === 'credit' ? e.amountKobo : -e.amountKobo;
      await t('accounts')
        .where({ id: e.accountId })
        .increment('balance_kobo', delta);
      await t('ledger_entries').insert({
        transaction_id: tx.id,
        account_id: e.accountId,
        direction: e.direction,
        amount_kobo: e.amountKobo,
      });
    }

    return tx;
  };

  return trx ? run(trx) : db.transaction(run);
}

module.exports = { postTransaction };