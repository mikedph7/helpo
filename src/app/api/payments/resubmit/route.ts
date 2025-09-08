import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PaymentStatus, PaymentType, PaymentMethodType } from '@prisma/client';

export const runtime = 'nodejs';

// POST /api/payments/resubmit - Resubmit payment proof after rejection
export async function POST(request: NextRequest) {
  return requireAuth(async (_req, user) => {
    try {
      const { 
        booking_id, 
        payment_method_id, // Changed name to be clearer 
        reference_number, 
        proof_image_url 
      } = await request.json();

      if (!booking_id || !payment_method_id || !proof_image_url) {
        return NextResponse.json(
          { error: 'Missing required fields: booking_id, payment_method_id, and proof_image_url are required' },
          { status: 400 }
        );
      }

      // Get the payment method details to get the method_type
      const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: parseInt(payment_method_id) }
      });

      if (!paymentMethod) {
        return NextResponse.json(
          { error: 'Invalid payment method' },
          { status: 400 }
        );
      }

      // Get booking details and verify ownership
      const booking = await prisma.booking.findUnique({
        where: { id: booking_id },
        include: { 
          user: true,
          payments: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      // Verify the user owns this booking
      if (booking.user_id !== user.id) {
        return NextResponse.json(
          { error: 'You can only resubmit payment for your own bookings' },
          { status: 403 }
        );
      }

      // Check if there's a rejected payment that can be resubmitted
      const lastPayment = booking.payments?.[0];
      if (!lastPayment || lastPayment.status !== 'failed') {
        return NextResponse.json(
          { error: 'No rejected payment found for this booking' },
          { status: 400 }
        );
      }

      // Create new payment record for resubmission
      const payment = await prisma.payment.create({
        data: {
          amount: booking.total_price,
          payment_method: paymentMethod.method_type as PaymentMethodType,
          payment_type: PaymentType.booking,
          status: PaymentStatus.pending,
          reference_number,
          proof_image_url,
          user_id: booking.user_id,
          booking_id
        }
      });

      // Update booking payment status back to pending
      await prisma.booking.update({
        where: { id: booking_id },
        data: { payment_status: 'pending' }
      });

      return NextResponse.json({
        message: 'Payment proof resubmitted successfully. Please wait for admin verification.',
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          payment_method: paymentMethod.name // Use the payment method name for display
        }
      });

    } catch (error) {
      console.error('Error resubmitting payment:', error);
      return NextResponse.json(
        { error: 'Failed to resubmit payment proof' },
        { status: 500 }
      );
    }
  })(request);
}
