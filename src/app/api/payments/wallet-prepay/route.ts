import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WalletService } from '@/lib/wallet-service';
import { PaymentMethodType, PaymentType, PaymentStatus } from '@prisma/client';

export const runtime = 'nodejs';

// POST /api/payments/wallet-prepay
// Charges user's wallet for a future booking and returns a paid payment_id to be used when creating the booking
export async function POST(request: NextRequest) {
  try {
    const { user_id, amount_cents, memo } = await request.json();

    if (!user_id || !amount_cents || amount_cents <= 0) {
      return NextResponse.json({ error: 'Invalid user or amount' }, { status: 400 });
    }

    // Ensure wallet has funds; will throw if insufficient
    await WalletService.payFromWallet(
      Number(user_id),
      Number(amount_cents),
      memo || 'Booking prepayment',
      `prepay_${Date.now()}`
    );

    // Record payment as paid (no booking yet)
  const payment = await prisma.payment.create({
      data: {
        user_id: Number(user_id),
    amount: Number(amount_cents),
    payment_method: PaymentMethodType.wallet,
    payment_type: PaymentType.booking,
    status: PaymentStatus.paid,
        admin_notes: 'Wallet prepay for booking (no booking_id yet)'
      }
    });

    return NextResponse.json({ payment_id: payment.id, status: 'paid' }, { status: 201 });
  } catch (error) {
    console.error('Wallet prepay error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment failed' },
      { status: 500 }
    );
  }
}
