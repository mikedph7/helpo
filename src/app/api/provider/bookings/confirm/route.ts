import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

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

    const { bookingId } = await req.json();
    
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
      return NextResponse.json({ error: 'Booking not found or cannot be confirmed' }, { status: 404 });
    }

    // Update booking status to confirmed
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: 'confirmed',
        updated_at: new Date()
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({
      message: 'Booking confirmed successfully',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Error confirming booking:', error);
    return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 });
  }
});
