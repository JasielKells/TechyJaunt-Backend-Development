const db = require('../src/config/db.pg');

async function main() {
  // 1. Every transaction is balanced
  const unbalanced = await db.raw(`
    SELECT transaction_id,
           SUM(CASE WHEN direction='credit' THEN amount_kobo ELSE -amount_kobo END) AS diff
    FROM ledger_entries
    GROUP BY transaction_id
    HAVING SUM(CASE WHEN direction='credit' THEN amount_kobo ELSE -amount_kobo END) <> 0
  `);
  if (unbalanced.rows.length) {
    console.error('FAIL: unbalanced transactions', unbalanced.rows);
    process.exit(1);
  }

  // 2. Cached balance matches ledger sum
  const mismatch = await db.raw(`
    SELECT a.id, a.owner_type, a.owner_id, a.balance_kobo,
           COALESCE(SUM(CASE WHEN le.direction='credit'
                             THEN le.amount_kobo ELSE -le.amount_kobo END), 0) AS ledger_sum
    FROM accounts a LEFT JOIN ledger_entries le ON le.account_id = a.id
    GROUP BY a.id
    HAVING a.balance_kobo <> COALESCE(SUM(CASE WHEN le.direction='credit'
                                              THEN le.amount_kobo ELSE -le.amount_kobo END), 0)
  `);
  if (mismatch.rows.length) {
    console.error('FAIL: cached balance mismatch', mismatch.rows);
    process.exit(1);
  }

  // 3. Invariant: sum(user wallets) + escrow + revenue + clearing + funding sources = 0
  //    Equivalently: SUM of ALL account balances = 0 in double-entry.
  const total = await db.raw(`SELECT COALESCE(SUM(balance_kobo),0) AS s FROM accounts`);
  if (Number(total.rows[0].s) !== 0) {
    console.error('FAIL: total balance non-zero:', total.rows[0].s);
    process.exit(1);
  }

  console.log('PASS');
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });