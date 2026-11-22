// All money is integer kobo. No floats — ever.
function assertIntKobo(v) {
  if (!Number.isInteger(v) || v < 0) throw new Error(`Invalid kobo amount: ${v}`);
  return v;
}
function percent(amountKobo, rate) {
  // compute commission with integer math: round half-up
  const raw = BigInt(amountKobo) * BigInt(Math.round(rate * 10000));
  const div = BigInt(10000);
  const q = raw / div;
  const r = raw % div;
  const rounded = r * BigInt(2) >= div ? q + BigInt(1) : q;
  return Number(rounded);
}
module.exports = { assertIntKobo, percent };