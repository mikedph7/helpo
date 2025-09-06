/*
  Warnings:

  - You are about to drop the column `wallet_balance` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."AccountType" AS ENUM ('USER', 'PLATFORM', 'ESCROW');

-- CreateEnum
CREATE TYPE "public"."EntryState" AS ENUM ('pending', 'posted', 'reversed');

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "wallet_balance";

-- CreateTable
CREATE TABLE "public"."wallet_accounts" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER,
    "account_type" "public"."AccountType" NOT NULL DEFAULT 'USER',
    "available_cents" INTEGER NOT NULL DEFAULT 0,
    "pending_cents" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ledger_entries" (
    "id" TEXT NOT NULL,
    "transfer_id" TEXT NOT NULL,
    "from_account_id" TEXT NOT NULL,
    "to_account_id" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "state" "public"."EntryState" NOT NULL DEFAULT 'pending',
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memo" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wallet_snapshots" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "balance_cents" INTEGER NOT NULL,
    "pending_cents" INTEGER NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL,
    "entry_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_accounts_user_id_key" ON "public"."wallet_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_entries_idempotency_key_key" ON "public"."ledger_entries"("idempotency_key");

-- CreateIndex
CREATE INDEX "ledger_entries_transfer_id_idx" ON "public"."ledger_entries"("transfer_id");

-- CreateIndex
CREATE INDEX "ledger_entries_from_account_id_idx" ON "public"."ledger_entries"("from_account_id");

-- CreateIndex
CREATE INDEX "ledger_entries_to_account_id_idx" ON "public"."ledger_entries"("to_account_id");

-- CreateIndex
CREATE INDEX "ledger_entries_state_idx" ON "public"."ledger_entries"("state");

-- CreateIndex
CREATE INDEX "ledger_entries_occurred_at_idx" ON "public"."ledger_entries"("occurred_at");

-- CreateIndex
CREATE INDEX "wallet_snapshots_snapshot_date_idx" ON "public"."wallet_snapshots"("snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_snapshots_account_id_snapshot_date_key" ON "public"."wallet_snapshots"("account_id", "snapshot_date");

-- AddForeignKey
ALTER TABLE "public"."wallet_accounts" ADD CONSTRAINT "wallet_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ledger_entries" ADD CONSTRAINT "ledger_entries_from_account_id_fkey" FOREIGN KEY ("from_account_id") REFERENCES "public"."wallet_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ledger_entries" ADD CONSTRAINT "ledger_entries_to_account_id_fkey" FOREIGN KEY ("to_account_id") REFERENCES "public"."wallet_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
