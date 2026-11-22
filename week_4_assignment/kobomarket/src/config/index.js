require('dotenv').config();
const cfg = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGO_URI,
  pg: {
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  },
  paystack: {
    secret: process.env.PAYSTACK_SECRET_KEY,
    baseUrl: process.env.PAYSTACK_BASE_URL,
  },
  commissionRate: Number(process.env.COMMISSION_RATE || 0.05),
  escrowTimeoutHours: Number(process.env.ESCROW_TIMEOUT_HOURS || 72),
  payoutMinimumKobo: Number(process.env.PAYOUT_MINIMUM_KOBO || 100000),
};
module.exports = cfg;