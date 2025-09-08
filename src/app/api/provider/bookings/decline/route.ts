import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { WalletService } from "@/lib/wallet-service";

export const runtime = 'nodejs';

export const POST = requireRole('PROVIDER', async (req: NextRequest, user) => {
  try {
    // Find provider record
    const provider = await prisma.provider.findFirst({
      where: { user_id: user.id }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const { bookingId, reason } = await req.json();
    
    // Find the booking and verify ownership
    const booking = await prisma.booking.findFirst({
      where: { 
        id: bookingId,
        provider_id: provider.id,
        status: 'pending'
      },
      include: {
        service: { select: { name: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found or cannot be declined' }, { status: 404 });
    }

    // Process refund since booking was already paid
    let refundResult = null;
    if (booking.payment_status === 'paid' && booking.total_price > 0) {
      try {
        refundResult = await WalletService.processRefund(
          booking.user_id,
          booking.total_price,
          bookingId,
          `Refund for declined booking: ${booking.service?.name || 'Service'}`
        );
      } catch (refundError) {
        console.error('Refund processing failed:', refundError);
        // Continue with booking decline even if refund fails
      }
    }

    // Update booking status to canceled
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: 'canceled',
        cancellation_reason: reason || 'Provider declined',
        canceled_at: new Date(),
        updated_at: new Date()
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, name: true } }
      }
    });

    const response: any = {
      message: 'Booking declined successfully',
      booking: updatedBooking
    };

    if (refundResult) {
      response.refund = {
        amount_cents: booking.total_price,
        refund_id: refundResult.refundId,
        user_balance: refundResult.userBalance
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error declining booking:', error);
    return NextResponse.json({ error: 'Failed to decline booking' }, { status: 500 });
  }
});
