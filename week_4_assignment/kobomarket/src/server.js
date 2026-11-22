const app = require('./app');
const cfg = require('./config');
const connectMongo = require('./config/db.mongo');
const logger = require('./config/logger');
const { startAutoComplete } = require('./jobs/autoComplete.job');
const { startPayoutProcessor } = require('./jobs/payoutProcessor.job');

(async () => {
  await connectMongo();
  app.listen(cfg.port, () => logger.info(`API up on :${cfg.port}`));
  startAutoComplete();
  startPayoutProcessor();
})();