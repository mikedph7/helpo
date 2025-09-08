import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WalletService } from "@/lib/wallet-service";
import { requireRole } from "@/lib/auth";

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireRole('PROVIDER', async (req: NextRequest, user) => {
    try {
      const { id } = await params;
      const bookingId = parseInt(id, 10);
      const body = await req.json();
      const { reason } = body;

      if (isNaN(bookingId)) {
        return NextResponse.json(
          { error: 'Invalid booking ID' },
          { status: 400 }
        );
      }

      // Find provider record linked to this user
      const provider = await prisma.provider.findFirst({
        where: { user_id: user.id }
      });

      if (!provider) {
        return NextResponse.json(
          { error: 'Provider profile not found' },
          { status: 404 }
        );
      }

      // Find the booking and verify ownership
      const booking = await prisma.booking.findFirst({
        where: { 
          id: bookingId,
          provider_id: provider.id,
          status: 'pending'
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, name: true } }
        }
      });

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found or cannot be declined' },
          { status: 404 }
        );
      }

      // Update booking status to canceled (declined by provider)
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          status: 'canceled',
          cancellation_reason: reason || 'Declined by provider',
          provider_confirmed_at: null, // Clear any previous approval
          updated_at: new Date()
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, name: true } }
        }
      });

      // Process refund to customer wallet since provider declined
      if (booking.payment_status === 'paid' && booking.total_price > 0) {
        try {
          await WalletService.processRefund(
            booking.user_id!,
            booking.total_price,
            booking.id,
            reason || 'Declined by provider'
          );
        } catch (refundError) {
          console.error('Failed to process refund:', refundError);
          // Continue with booking decline even if refund fails
          // This should be handled by a background job or manual process
        }
      }

      return NextResponse.json({
        message: 'Booking declined successfully',
        booking: updatedBooking
      });

    } catch (error) {
      console.error('Error declining booking:', error);
      return NextResponse.json(
        { error: 'Failed to decline booking' },
        { status: 500 }
      );
    }
  })(request);
}
