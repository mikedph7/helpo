import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentStatus, PaymentType, PaymentMethodType, BookingStatus } from '@prisma/client';
import { NewBookingStatus, NewPaymentStatus, BookingStatusMapping, PaymentStatusMapping } from '@/lib/status-system';

// POST /api/payments/manual-prepay
// Stores a manual payment proof and creates booking with pending status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Manual prepay request body:', body);
    
    const { 
      user_id, 
      payment_method, 
      reference_number, 
      proof_image_url, 
      amount_cents,
      service_id,
      provider_id,
      scheduled_at,
      location,
      notes
    } = body;

    if (!user_id || !payment_method || !proof_image_url || !amount_cents) {
      console.log('Missing required fields:', { user_id, payment_method, proof_image_url, amount_cents });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create payment record with proof_submitted status (mapped to 'pending')
      const payment = await tx.payment.create({
        data: {
          user_id: Number(user_id),
          amount: Number(amount_cents),
          payment_method: payment_method as PaymentMethodType,
          payment_type: PaymentType.booking,
          status: 'pending' as PaymentStatus, // Maps to proof_submitted in new system
          reference_number,
          proof_image_url,
          admin_notes: 'Manual prepay proof submitted; awaiting admin verification'
        }
      });

      // If booking details are provided, create the booking immediately
      if (service_id && provider_id && scheduled_at) {
        const booking = await tx.booking.create({
          data: {
            user_id: Number(user_id),
            service_id: Number(service_id),
            provider_id: Number(provider_id),
            scheduled_at: new Date(scheduled_at),
            location,
            notes,
            total_price: Number(amount_cents),
            status: 'pending' as BookingStatus // Maps to awaiting_payment_verification in new system
          }
        });

        // Update payment with booking_id
        await tx.payment.update({
          where: { id: payment.id },
          data: { booking_id: booking.id }
        });

        return { payment, booking };
      }

      return { payment };
    });

    return NextResponse.json({ 
      payment_id: result.payment.id, 
      booking_id: result.booking?.id,
      status: result.payment.status 
    }, { status: 201 });
  } catch (error) {
    console.error('Manual prepay error:', error);
    return NextResponse.json({ error: 'Failed to submit payment proof' }, { status: 500 });
  }
}
