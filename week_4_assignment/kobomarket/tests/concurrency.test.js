const request = require('supertest');
const app = require('../src/app');

test('10 concurrent checkouts, wallet affords 3, exactly 3 succeed', async () => {
  const setup = await setupWalletThatAffordsThree();
  const payload = { items: [{ productId: setup.productId, quantity: 1 }] };

  const results = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${setup.token}`)
        .set('Idempotency-Key', require('uuid').v4())
        .send(payload)
    )
  );
  const ok = results.filter((r) => r.status === 201).length;
  expect(ok).toBe(3);
  // And no money was created
  const audit = await runAudit();
  expect(audit).toBe('PASS');
});