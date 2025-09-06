import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { WalletService } from '@/lib/wallet-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  return requireAuth(async (req, user) => {
    try {
      const body = await req.json();
      const { booking_id, amount_cents } = body;

      if (!booking_id || !amount_cents || amount_cents <= 0) {
        return NextResponse.json(
          { error: 'Invalid booking ID or amount' },
          { status: 400 }
        );
      }

      // Verify booking belongs to user
      const booking = await prisma.booking.findUnique({
        where: { id: parseInt(booking_id) },
        select: { 
          id: true, 
          user_id: true, 
          payment_status: true,
          total_amount_cents: true
        }
      });

      if (!booking || booking.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      if (booking.payment_status === 'PAID') {
        return NextResponse.json(
          { error: 'Booking is already paid' },
          { status: 400 }
        );
      }

      // Verify amount matches booking total
      if (amount_cents !== booking.total_amount_cents) {
        return NextResponse.json(
          { error: 'Amount mismatch' },
          { status: 400 }
        );
      }

      // Check wallet balance
      const balance = await WalletService.getUserBalance(user.id);
      if (balance.available_cents < amount_cents) {
        return NextResponse.json(
          { error: 'Insufficient wallet balance' },
          { status: 400 }
        );
      }

      // Process wallet payment
      const transfer = await WalletService.payFromWallet(
        user.id,
        amount_cents,
        `Payment for booking #${booking_id}`,
        `booking_${booking_id}`
      );

      // Update booking payment status
      await prisma.booking.update({
        where: { id: booking.id },
        data: { payment_status: 'PAID' }
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          user_id: user.id,
          booking_id: booking.id,
          amount_cents,
          status: 'COMPLETED',
          metadata: {
            type: 'wallet_payment',
            transfer_id: transfer.transferId
          }
        }
      });

      const newBalance = await WalletService.getUserBalance(user.id);

      return NextResponse.json({
        success: true,
        transfer_id: transfer.transferId,
        new_balance: newBalance,
        message: 'Payment completed successfully'
      });
    } catch (error) {
      console.error('Wallet payment error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Payment failed' },
        { status: 500 }
      );
    }
  })(request);
}
