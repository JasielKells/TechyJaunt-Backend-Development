const connectMongo = require('../src/config/db.mongo');
const db = require('../src/config/db.pg');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const Product = require('../src/models/Product');
const { getOrCreateUserWallet, getSystemAccount } = require('../src/repositories/account.repo');
const { postTransaction } = require('../src/services/ledger.service');
const bcrypt = require('bcryptjs');

(async () => {
  await connectMongo();
  // System accounts
  await db.transaction(async (trx) => {
    for (const name of ['PLATFORM_ESCROW', 'PLATFORM_REVENUE', 'PLATFORM_PAYOUT_CLEARING', 'EXTERNAL_FUNDING', 'EXTERNAL_PAYOUTS']) {
      const exists = await trx('accounts').where({ owner_type: 'system', owner_id: name }).first();
      if (!exists) await trx('accounts').insert({ owner_type: 'system', owner_id: name });
    }
  });
  // Admin + vendors + buyers
  const admin = await User.create({ email: 'admin@kobo.test', passwordHash: await bcrypt.hash('Password1!', 10), role: 'admin', isVerified: true });
  await db.transaction((trx) => getOrCreateUserWallet(trx, String(admin._id), 'user'));

  const vendors = [];
  for (let i = 0; i < 3; i++) {
    const u = await User.create({ email: `vendor${i}@kobo.test`, passwordHash: await bcrypt.hash('Password1!', 10), role: 'vendor', isVerified: true });
    await Vendor.create({ userId: String(u._id), storeName: `Store ${i}`, status: 'approved' });
    await db.transaction((trx) => getOrCreateUserWallet(trx, String(u._id), 'vendor'));
    vendors.push(u);
  }
  // 20 products
  for (let i = 0; i < 20; i++) {
    await Product.create({
      name: `Product ${i}`, slug: `product-${i}`, description: `Description ${i}`,
      priceKobo: 500000 + i * 1000, vendorId: String(vendors[i % 3]._id),
      stock: 100, isActive: true, category: ['electronics', 'fashion', 'home'][i % 3],
    });
  }
  // 5 buyers with ₦50k each funded (via EXTERNAL_FUNDING source)
  for (let i = 0; i < 5; i++) {
    const u = await User.create({ email: `buyer${i}@kobo.test`, passwordHash: await bcrypt.hash('Password1!', 10), role: 'buyer', isVerified: true });
    await db.transaction(async (trx) => {
      const w = await getOrCreateUserWallet(trx, String(u._id), 'user');
      const ext = await getSystemAccount(trx, 'EXTERNAL_FUNDING');
      await postTransaction({
        trx, type: 'FUNDING', reference: `SEED-${u._id}`,
        entries: [
          { accountId: ext.id, direction: 'debit', amountKobo: 5000000 },
          { accountId: w.id, direction: 'credit', amountKobo: 5000000 },
        ],
      });
    });
  }
  console.log('Seeded.');
  process.exit(0);
})();