# KoboMarket

## Quick start
docker-compose up --build
docker-compose exec api npm run seed
# API: http://localhost:3000  Swagger: /api-docs

## Two-database split
MongoDB: users, vendors, products, carts, reviews, notifications — flexible shapes, read-heavy.
PostgreSQL: wallets, ledger, orders, sub_orders, payouts, disputes — money, ACID, constraints.

**Problems I faced keeping them in sync:**
- User created in Mongo but wallet creation failed → I compensate by marking the Mongo user
  `walletPending` and a retry job creates the wallet. Same pattern for product stock.
- Stock decrement after PG escrow commit fails → `compensateCheckout` reverses the escrow
  entry and cancels the order.

## Concurrency
- Wallet: `SELECT ... FOR UPDATE` on `accounts` before checking balance.
- Stock: atomic `Product.updateOne({ stock: { $gte: qty } }, { $inc: { stock: -qty } })`.
- Payout: partial unique index `uniq_pending_payout_per_vendor` + row-lock on wallet.
- Dispute vs auto-complete race: `completeSubOrder` re-checks `disputes.status='OPEN'`
  inside the `FOR UPDATE` lock.

## Idempotency
- `Idempotency-Key` header persisted in `idempotency_keys` (key, body hash, response).
- Webhook idempotency via unique `transactions.reference`.

## Known limitations
- Compensating actions can leave money briefly in escrow if the process dies between
  the PG commit and the compensating action; an outbox worker would be more robust.
- `mockTransfer` is stubbed for local tests (drop in Paystack Transfers).