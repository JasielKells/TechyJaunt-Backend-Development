const TRANSITIONS = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID:            ['SHIPPED', 'CANCELLED', 'DISPUTED'],
  SHIPPED:         ['DELIVERED', 'DISPUTED'],
  DELIVERED:       ['COMPLETED', 'DISPUTED'],
  COMPLETED:       [],
  CANCELLED:       [],
  DISPUTED:        ['COMPLETED', 'CANCELLED'], // admin resolution
};
function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}
function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    const { Errors } = require('./errors');
    throw Errors.conflict(`Invalid transition ${from} → ${to}`);
  }
}
module.exports = { canTransition, assertTransition };