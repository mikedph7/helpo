import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { WalletService } from '@/lib/wallet-service';

// Get wallet balance and transaction history
export async function GET(
  request: NextRequest, 
  { params }: { params: { userId: string } }
) {
  return requireAuth(async (req, user) => {
    const userId = parseInt(params.userId);
    
    // Users can only access their own wallet data (unless admin)
    if (user.id !== userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    try {
      const [balance, transactions] = await Promise.all([
        WalletService.getUserBalance(userId),
        WalletService.getUserTransactionHistory(userId, 20)
      ]);

      return NextResponse.json({
        balance,
        transactions
      });
    } catch (error) {
      console.error('Wallet fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wallet data' },
        { status: 500 }
      );
    }
  })(request);
}

// Reload wallet (add money)
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return requireAuth(async (req, user) => {
    const userId = parseInt(params.userId);
    
    // Users can only reload their own wallet (unless admin)
    if (user.id !== userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    try {
      const body = await req.json();
      const { amount_cents, memo, reference_id } = body;

      if (!amount_cents || amount_cents <= 0) {
        return NextResponse.json(
          { error: 'Invalid amount' },
          { status: 400 }
        );
      }

      const transfer = await WalletService.reloadWallet(
        userId,
        amount_cents,
        memo || 'Wallet reload',
        reference_id
      );

      const newBalance = await WalletService.getUserBalance(userId);

      return NextResponse.json({
        success: true,
        transfer_id: transfer.transferId,
        new_balance: newBalance
      });
    } catch (error) {
      console.error('Wallet reload error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to reload wallet' },
        { status: 500 }
      );
    }
  })(request);
}
