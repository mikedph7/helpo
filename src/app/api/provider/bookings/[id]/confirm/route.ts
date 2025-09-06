import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireRole('PROVIDER', async (req: NextRequest, user) => {
    try {
      const { id } = await params;
      const bookingId = parseInt(id, 10);

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
          service: { select: { auto_confirm: true } },
          user: { select: { id: true, name: true, email: true } }
        }
      });

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found or cannot be confirmed' },
          { status: 404 }
        );
      }

      // Determine the new status based on payment status
      // For manual approval services (auto_confirm = false):
      // - Provider approval + paid = confirmed  
      // - Provider approval + unpaid = pending (waiting for payment verification)
      
      let newStatus: 'pending' | 'confirmed' = 'pending';
      let message = '';
      
      if (booking.payment_status === 'paid') {
        // Payment is already verified, so provider approval completes the booking
        newStatus = 'confirmed';
        message = 'Booking confirmed successfully';
      } else {
        // Payment not yet verified, booking stays pending until payment is verified
        newStatus = 'pending';
        message = 'Booking approved by provider. Waiting for payment verification to confirm.';
      }

      // Update booking with provider approval
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          status: newStatus,
          updated_at: new Date(),
          // Set provider confirmation timestamp
          provider_confirmed_at: new Date()
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, name: true } }
        }
      });

      return NextResponse.json({
        message,
        booking: updatedBooking
      });

    } catch (error) {
      console.error('Error confirming booking:', error);
      return NextResponse.json(
        { error: 'Failed to confirm booking' },
        { status: 500 }
      );
    }
  })(request);
}
