import { PrismaClient, AccountType, EntryState } from '@prisma/client';

const prisma = new PrismaClient();

export class WalletService {
  
  /**
   * Get or create a wallet account for a user
   */
  static async getOrCreateUserWallet(userId: number) {
    let account = await prisma.walletAccount.findUnique({
      where: { user_id: userId }
    });

    if (!account) {
      account = await prisma.walletAccount.create({
        data: {
          user_id: userId,
          account_type: AccountType.USER,
          available_cents: 0,
          pending_cents: 0,
          version: 0
        }
      });
    }

    return account;
  }

  /**
   * Get or create the platform account
   */
  static async getOrCreatePlatformAccount() {
    let account = await prisma.walletAccount.findFirst({
      where: { 
        account_type: AccountType.PLATFORM,
        user_id: null 
      }
    });

    if (!account) {
      account = await prisma.walletAccount.create({
        data: {
          account_type: AccountType.PLATFORM,
          user_id: null,
          available_cents: 0,
          pending_cents: 0,
          version: 0
        }
      });
    }

    return account;
  }

  /**
   * Get computed balance for a wallet account (sum from ledger)
   */
  static async getComputedBalance(accountId: string) {
    const credits = await prisma.ledgerEntry.aggregate({
      where: {
        to_account_id: accountId,
        state: EntryState.posted
      },
      _sum: { amount_cents: true }
    });

    const debits = await prisma.ledgerEntry.aggregate({
      where: {
        from_account_id: accountId,
        state: EntryState.posted
      },
      _sum: { amount_cents: true }
    });

    const pending = await prisma.ledgerEntry.aggregate({
      where: {
        OR: [
          { from_account_id: accountId, state: EntryState.pending },
          { to_account_id: accountId, state: EntryState.pending }
        ]
      },
      _sum: { amount_cents: true }
    });

    return {
      available: (credits._sum.amount_cents || 0) - (debits._sum.amount_cents || 0),
      pending: pending._sum.amount_cents || 0
    };
  }

  /**
   * Create a transfer between two accounts (double-entry)
   */
  static async createTransfer({
    fromAccountId,
    toAccountId,
    amountCents,
    memo,
    referenceType,
    referenceId,
    idempotencyKey,
    state = EntryState.pending
  }: {
    fromAccountId: string;
    toAccountId: string;
    amountCents: number;
    memo?: string;
    referenceType?: string;
    referenceId?: string;
    idempotencyKey: string;
    state?: EntryState;
  }) {
    if (amountCents <= 0) {
      throw new Error('Transfer amount must be positive');
    }

    const transferId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return await prisma.$transaction(async (tx) => {
      // Lock accounts for update (optimistic locking)
      const fromAccount = await tx.walletAccount.findUnique({
        where: { id: fromAccountId }
      });

      const toAccount = await tx.walletAccount.findUnique({
        where: { id: toAccountId }
      });

      if (!fromAccount || !toAccount) {
        throw new Error('Account not found');
      }

      // Check sufficient balance for user accounts
      if (fromAccount.account_type === AccountType.USER && state === EntryState.posted) {
        if (fromAccount.available_cents < amountCents) {
          throw new Error('Insufficient balance');
        }
      }

      // Create the transfer entries (double-entry bookkeeping)
      const entries = await Promise.all([
        // Debit entry (money leaving from_account)
        tx.ledgerEntry.create({
          data: {
            transfer_id: transferId,
            from_account_id: fromAccountId,
            to_account_id: toAccountId,
            amount_cents: amountCents,
            state,
            memo: memo || `Transfer ${transferId}`,
            reference_type: referenceType,
            reference_id: referenceId,
            idempotency_key: `${idempotencyKey}_debit`
          }
        })
      ]);

      // Update cached balances
      const balanceChanges = this.calculateBalanceChanges(
        fromAccountId,
        toAccountId,
        amountCents,
        state
      );

      await Promise.all([
        tx.walletAccount.update({
          where: { id: fromAccountId },
          data: {
            available_cents: { increment: balanceChanges.from.available },
            pending_cents: { increment: balanceChanges.from.pending },
            version: { increment: 1 }
          }
        }),
        tx.walletAccount.update({
          where: { id: toAccountId },
          data: {
            available_cents: { increment: balanceChanges.to.available },
            pending_cents: { increment: balanceChanges.to.pending },
            version: { increment: 1 }
          }
        })
      ]);

      return {
        transferId,
        entries,
        fromAccount,
        toAccount
      };
    });
  }

  /**
   * Settlement: Convert pending entries to posted
   */
  static async settlePendingTransfer(transferId: string) {
    return await prisma.$transaction(async (tx) => {
      const entries = await tx.ledgerEntry.findMany({
        where: { 
          transfer_id: transferId,
          state: EntryState.pending
        },
        include: {
          from_account: true,
          to_account: true
        }
      });

      if (entries.length === 0) {
        throw new Error('No pending entries found for transfer');
      }

      // Update entries to posted
      await tx.ledgerEntry.updateMany({
        where: { transfer_id: transferId },
        data: { state: EntryState.posted }
      });

      // Update cached balances for each affected account
      for (const entry of entries) {
        const changes = this.calculateBalanceChanges(
          entry.from_account_id,
          entry.to_account_id,
          entry.amount_cents,
          EntryState.posted,
          EntryState.pending // previous state
        );

        await Promise.all([
          tx.walletAccount.update({
            where: { id: entry.from_account_id },
            data: {
              available_cents: { increment: changes.from.available },
              pending_cents: { increment: changes.from.pending },
              version: { increment: 1 }
            }
          }),
          tx.walletAccount.update({
            where: { id: entry.to_account_id },
            data: {
              available_cents: { increment: changes.to.available },
              pending_cents: { increment: changes.to.pending },
              version: { increment: 1 }
            }
          })
        ]);
      }

      return entries;
    });
  }

  /**
   * Calculate balance changes for cache updates
   */
  private static calculateBalanceChanges(
    fromAccountId: string,
    toAccountId: string,
    amountCents: number,
    newState: EntryState,
    previousState?: EntryState
  ) {
    const changes = {
      from: { available: 0, pending: 0 },
      to: { available: 0, pending: 0 }
    };

    if (newState === EntryState.pending && !previousState) {
      // New pending transaction
      changes.from.pending -= amountCents;
      changes.to.pending += amountCents;
    } else if (newState === EntryState.posted && previousState === EntryState.pending) {
      // Settlement: pending -> posted
      changes.from.pending += amountCents; // remove from pending
      changes.from.available -= amountCents; // subtract from available
      changes.to.pending -= amountCents; // remove from pending
      changes.to.available += amountCents; // add to available
    } else if (newState === EntryState.posted && !previousState) {
      // Direct posted transaction
      changes.from.available -= amountCents;
      changes.to.available += amountCents;
    }

    return changes;
  }

  /**
   * Get wallet balance for a user
   */
  static async getUserBalance(userId: number) {
    const account = await this.getOrCreateUserWallet(userId);
    return {
      available_cents: account.available_cents,
      pending_cents: account.pending_cents,
      total_cents: account.available_cents + account.pending_cents
    };
  }

  /**
   * Reload wallet (add money from external source)
   */
  static async reloadWallet(userId: number, amountCents: number, memo: string, referenceId?: string) {
    const userAccount = await this.getOrCreateUserWallet(userId);
    const platformAccount = await this.getOrCreatePlatformAccount();

    const idempotencyKey = `reload_${userId}_${referenceId || Date.now()}`;

    return await this.createTransfer({
      fromAccountId: platformAccount.id, // Platform is the source of new money
      toAccountId: userAccount.id,
      amountCents,
      memo,
      referenceType: 'wallet_reload',
      referenceId,
      idempotencyKey,
      state: EntryState.posted // Reload is immediate
    });
  }

  /**
   * Pay from wallet
   */
  static async payFromWallet(userId: number, amountCents: number, memo: string, referenceId?: string) {
    const userAccount = await this.getOrCreateUserWallet(userId);
    const platformAccount = await this.getOrCreatePlatformAccount();

    const idempotencyKey = `payment_${userId}_${referenceId || Date.now()}`;

    return await this.createTransfer({
      fromAccountId: userAccount.id,
      toAccountId: platformAccount.id,
      amountCents,
      memo,
      referenceType: 'wallet_payment',
      referenceId,
      idempotencyKey,
      state: EntryState.posted
    });
  }

  /**
   * Get transaction history for a user
   */
  static async getUserTransactionHistory(userId: number, limit = 50, offset = 0) {
    const account = await this.getOrCreateUserWallet(userId);

    const entries = await prisma.ledgerEntry.findMany({
      where: {
        OR: [
          { from_account_id: account.id },
          { to_account_id: account.id }
        ]
      },
      orderBy: { occurred_at: 'desc' },
      take: limit,
      skip: offset,
      include: {
        from_account: {
          include: { user: { select: { name: true, email: true } } }
        },
        to_account: {
          include: { user: { select: { name: true, email: true } } }
        }
      }
    });

    return entries.map(entry => ({
      id: entry.id,
      transfer_id: entry.transfer_id,
      amount_cents: entry.amount_cents,
      type: entry.from_account_id === account.id ? 'debit' : 'credit',
      state: entry.state,
      memo: entry.memo,
      reference_type: entry.reference_type,
      reference_id: entry.reference_id,
      occurred_at: entry.occurred_at,
      other_account: entry.from_account_id === account.id ? entry.to_account : entry.from_account
    }));
  }

  /**
   * Reconcile cached balances (run periodically)
   */
  static async reconcileAccount(accountId: string) {
    const computed = await this.getComputedBalance(accountId);
    const account = await prisma.walletAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const discrepancy = {
      available: computed.available - account.available_cents,
      pending: computed.pending - account.pending_cents
    };

    if (discrepancy.available !== 0 || discrepancy.pending !== 0) {
      console.warn(`Balance discrepancy for account ${accountId}:`, discrepancy);
      
      // Update cached balances to match computed values
      await prisma.walletAccount.update({
        where: { id: accountId },
        data: {
          available_cents: computed.available,
          pending_cents: computed.pending,
          version: { increment: 1 }
        }
      });
    }

    return { computed, cached: account, discrepancy };
  }

  /**
   * Process a refund from platform to user
   * Used when a provider cancels a booking and customer needs refund
   */
  static async processRefund(
    userId: number,
    amountCents: number,
    bookingId: number,
    reason: string = 'Booking cancelled by provider'
  ) {
    console.log(`🔄 Processing refund: ${amountCents} cents to user ${userId} for booking ${bookingId}`);

    const platformAccount = await this.getOrCreatePlatformAccount();
    const userAccount = await this.getOrCreateUserWallet(userId);

    const refundResult = await this.createTransfer({
      fromAccountId: platformAccount.id,
      toAccountId: userAccount.id,
      amountCents,
      memo: reason,
      referenceType: 'booking',
      referenceId: bookingId.toString(),
      idempotencyKey: `booking-refund-${bookingId}`
    });

    // Immediately settle the refund
    const settleResult = await this.settlePendingTransfer(refundResult.transferId);

    console.log(`✅ Refund processed: ${amountCents} cents refunded to user ${userId}`);

    return {
      refundId: refundResult.transferId,
      settleResult,
      userBalance: await this.getUserBalance(userId)
    };
  }
}
