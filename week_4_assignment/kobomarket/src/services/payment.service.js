const axios = require('axios');
const crypto = require('crypto');
const cfg = require('../config');

async function initializePayment({ email, amountKobo, reference, callbackUrl }) {
  const res = await axios.post(
    `${cfg.paystack.baseUrl}/transaction/initialize`,
    { email, amount: amountKobo, reference, callback_url: callbackUrl },
    { headers: { Authorization: `Bearer ${cfg.paystack.secret}` } }
  );
  return res.data.data; // { authorization_url, access_code, reference }
}

async function verifyPayment(reference) {
  const res = await axios.get(
    `${cfg.paystack.baseUrl}/transaction/verify/${reference}`,
    { headers: { Authorization: `Bearer ${cfg.paystack.secret}` } }
  );
  return res.data.data; // { status: 'success', amount, ... }
}

function verifyWebhookSignature(rawBody, signature) {
  const hash = crypto
    .createHmac('sha512', cfg.paystack.secret)
    .update(rawBody)
    .digest('hex');
  // constant-time compare
  if (!signature || hash.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

module.exports = { initializePayment, verifyPayment, verifyWebhookSignature };