const db = require('../config/db.pg');
const { postTransaction } = require('./ledger.service');
const { getOrCreateUserWallet, getSystemAccount } = require('../repositories/account.repo');
const { verifyPayment } = require('./payment.service');

async function getWallet(userId) {
  return db.transaction((trx) => getOrCreateUserWallet(trx, userId));
}

async function creditFunding({ userId, reference, amountKobo }) {
  // Idempotent: if a transaction with this reference already exists, do nothing
  const existing = await db('transactions').where({ reference }).first();
  if (existing) return { alreadyProcessed: true };

  return db.transaction(async (trx) => {
    // re-check inside transaction
    const dup = await trx('transactions').where({ reference }).forUpdate().first();
    if (dup) return { alreadyProcessed: true };

    const wallet = await getOrCreateUserWallet(trx, userId, 'user');
    // Paystack money is "external" — we credit a virtual funding source and the wallet.
    // The funding source has no row; instead we use PLATFORM_ESCROW-style system account named EXTERNAL_FUNDING
    const external = await getSystemAccount(trx, 'EXTERNAL_FUNDING');

    await postTransaction({
      trx, type: 'FUNDING', reference,
      metadata: { userId, amountKobo },
      entries: [
        { accountId: external.id, direction: 'debit', amountKobo },
        { accountId: wallet.id,     direction: 'credit', amountKobo },
      ],
    });
    return { alreadyProcessed: false };
  });
}

async function handleWebhook(rawBody, signature) {
  const { verifyWebhookSignature } = require('./payment.service');
  if (!verifyWebhookSignature(rawBody, signature)) {
    const { Errors } = require('../utils/errors');
    throw Errors.unauthorized('Invalid webhook signature');
  }
  const event = JSON.parse(rawBody.toString());
  if (event.event !== 'charge.success') return { ignored: true };

  const ref = event.data.reference;
  // Re-verify with Paystack
  const verified = await verifyPayment(ref);
  if (verified.status !== 'success') return { ignored: true };

  // Find our stored pending funding (set when user called /wallet/fund)
  const meta = event.data.metadata || {};
  const userId = meta.userId;
  if (!userId) return { ignored: true };

  return creditFunding({ userId, reference: ref, amountKobo: verified.amount });
}
module.exports = { getWallet, creditFunding, handleWebhook };