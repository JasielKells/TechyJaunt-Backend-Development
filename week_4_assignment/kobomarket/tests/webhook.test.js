test('webhook twice credits once', async () => {
  const { rawBody, sig } = buildSignedWebhook({ event: 'charge.success', data: { reference: 'ref_1', amount: 5000, metadata: { userId: 'u1' } } });
  await request(app).post('/api/v1/webhooks/paystack').set('x-paystack-signature', sig).set('Content-Type', 'application/json').send(rawBody);
  await request(app).post('/api/v1/webhooks/paystack').set('x-paystack-signature', sig).set('Content-Type', 'application/json').send(rawBody);
  const wallet = await db('accounts').where({ owner_id: 'u1', owner_type: 'user' }).first();
  expect(Number(wallet.balance_kobo)).toBe(5000);
});

test('invalid signature rejected', async () => {
  const res = await request(app).post('/api/v1/webhooks/paystack').set('x-paystack-signature', 'bad').set('Content-Type', 'application/json').send('{}');
  expect(res.status).toBe(401);
});