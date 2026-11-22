const db = require('../config/db.pg');

async function revenueByDay(from, to) {
  return db.raw(`
    SELECT DATE(le.created_at) AS day,
           SUM(le.amount_kobo) AS revenue_kobo
    FROM ledger_entries le
    JOIN accounts a ON a.id = le.account_id
    WHERE a.owner_type = 'system'
      AND a.owner_id = 'PLATFORM_REVENUE'
      AND le.direction = 'credit'
      AND le.created_at BETWEEN ? AND ?
    GROUP BY DATE(le.created_at)
    ORDER BY day;
  `, [from, to]).then((r) => r.rows);
}

async function topVendorsThisMonth() {
  return db.raw(`
    SELECT so.vendor_id, SUM(so.subtotal_kobo) AS sales_kobo
    FROM sub_orders so
    WHERE so.status = 'COMPLETED'
      AND so.completed_at >= date_trunc('month', now())
    GROUP BY so.vendor_id
    ORDER BY sales_kobo DESC
    LIMIT 10;
  `).then((r) => r.rows);
}

async function totalInEscrow() {
  return db('accounts')
    .where({ owner_type: 'system', owner_id: 'PLATFORM_ESCROW' })
    .first()
    .then((r) => ({ escrow_kobo: r ? Number(r.balance_kobo) : 0 }));
}

async function reconciliation() {
  return db.raw(`
    SELECT a.id, a.owner_type, a.owner_id, a.balance_kobo,
           COALESCE(SUM(CASE WHEN le.direction = 'credit'
                             THEN le.amount_kobo
                             ELSE -le.amount_kobo END), 0) AS ledger_sum_kobo
    FROM accounts a
    LEFT JOIN ledger_entries le ON le.account_id = a.id
    GROUP BY a.id
    HAVING a.balance_kobo <> COALESCE(SUM(CASE WHEN le.direction = 'credit'
                                               THEN le.amount_kobo
                                               ELSE -le.amount_kobo END), 0)
  `).then((r) => r.rows);
}
module.exports = { revenueByDay, topVendorsThisMonth, totalInEscrow, reconciliation };