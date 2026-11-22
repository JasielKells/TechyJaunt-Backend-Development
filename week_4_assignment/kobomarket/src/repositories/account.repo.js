const db = require('../config/db.pg');

async function getOrCreateUserWallet(trx, userId, ownerType = 'user') {
  const existing = await trx('accounts')
    .where({ owner_type: ownerType, owner_id: userId, currency: 'NGN' })
    .first();
  if (existing) return existing;
  const [row] = await trx('accounts')
    .insert({ owner_type: ownerType, owner_id: userId, currency: 'NGN' })
    .returning('*');
  return row;
}
async function getSystemAccount(trx, name) {
  const row = await trx('accounts')
    .where({ owner_type: 'system', owner_id: name, currency: 'NGN' })
    .first();
  if (!row) throw new Error(`System account ${name} missing`);
  return row;
}
async function lockAccountForUpdate(trx, accountId) {
  const row = await trx('accounts').where({ id: accountId }).forUpdate().first();
  if (!row) throw new Error(`Account ${accountId} not found`);
  return row;
}
module.exports = { getOrCreateUserWallet, getSystemAccount, lockAccountForUpdate };