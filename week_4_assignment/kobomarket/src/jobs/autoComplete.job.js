const cron = require('node-cron');
const db = require('../config/db.pg');
const cfg = require('../config');
const { completeSubOrder } = require('../services/escrow.service');
const logger = require('../config/logger');

function startAutoComplete() {
  cron.schedule('0 * * * *', async () => { // every hour
    try {
      const cutoff = new Date(Date.now() - cfg.escrowTimeoutHours * 3600 * 1000);
      // Find SHIPPED sub-orders older than cutoff with no OPEN dispute
      const rows = await db('sub_orders as s')
        .leftJoin('disputes as d', function () {
          this.on('d.sub_order_id', '=', 's.id').andOn('d.status', '=', db.raw("'OPEN'"));
        })
        .where('s.status', 'SHIPPED')
        .andWhere('s.shipped_at', '<', cutoff)
        .whereNull('d.id')
        .select('s.id');
      for (const r of rows) {
        await completeSubOrder(r.id, { forced: false });
      }
      logger.info({ count: rows.length }, 'auto-complete job ran');
    } catch (e) {
      logger.error({ err: e }, 'auto-complete job failed');
    }
  });
}
module.exports = { startAutoComplete };