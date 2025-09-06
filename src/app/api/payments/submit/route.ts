import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentStatus, PaymentType } from '@prisma/client';
import { WalletService } from '@/lib/wallet-service';

// POST /api/payments/submit - Submit payment proof for manual payment
export async function POST(request: NextRequest) {
  try {
    const { 
      booking_id, 
      payment_method, 
      reference_number, 
      proof_image_url,
      amount 
    } = await request.json();

    if (!booking_id || !payment_method || !proof_image_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: booking_id },
      include: { user: true }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Create payment record
  const payment = await prisma.payment.create({
      data: {
        amount: amount || booking.total_price,
    payment_method: payment_method,
    payment_type: PaymentType.booking,
    status: PaymentStatus.pending,
        reference_number,
        proof_image_url,
        user_id: booking.user_id,
        booking_id
      }
    });

    // Update booking payment status
    await prisma.booking.update({
      where: { id: booking_id },
  data: { payment_status: 'pending' }
    });

    return NextResponse.json({
      message: 'Payment proof submitted successfully',
      payment_id: payment.id,
      status: 'pending'
    });

  } catch (error) {
    console.error('Error submitting payment proof:', error);
    return NextResponse.json(
      { error: 'Failed to submit payment proof' },
      { status: 500 }
    );
  }
}

// PUT /api/payments/verify/[paymentId] - Admin endpoint to verify payment
export async function PUT(request: NextRequest) {
  try {
    const { payment_id, action, admin_notes, admin_id } = await request.json();

    if (!payment_id || !action || !admin_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: payment_id },
      include: { booking: true, user: true }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment_id },
      data: {
        status: action === 'approve' ? 'paid' : 'failed',
        admin_notes,
        verified_by: admin_id,
        verified_at: new Date()
      }
    });

    // If approved, update booking and handle wallet transaction
    if (action === 'approve') {
      if (payment.payment_type === 'booking' && payment.booking) {
        // Update booking payment status
        await prisma.booking.update({
          where: { id: payment.booking_id! },
          data: { 
            payment_status: 'paid',
            status: 'confirmed'
          }
        });
      } else if (payment.payment_type === 'wallet_reload') {
        // Add money to user's wallet using ledger-based wallet service
        await WalletService.reloadWallet(payment.user_id, payment.amount, `Wallet reload via ${payment.payment_method}`, payment.id.toString());
      }
    }

    return NextResponse.json({
      message: `Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      payment: updatedPayment
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
