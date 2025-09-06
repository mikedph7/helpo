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

      // Get booking and verify ownership
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          provider_id: provider.id
        }
      });

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      // Only confirmed bookings can be marked as completed
      if (booking.status !== 'confirmed') {
        return NextResponse.json(
          { error: 'Only confirmed bookings can be marked as completed' },
          { status: 400 }
        );
      }

      // Update booking status to completed
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'completed',
          updated_at: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          service: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // TODO: Trigger payment release to provider wallet/earnings
      // This would involve updating the provider's earnings balance
      // and creating a transaction record for the completed service

      return NextResponse.json(updatedBooking);
    } catch (error) {
      console.error('Error completing booking:', error);
      return NextResponse.json(
        { error: 'Failed to complete booking' },
        { status: 500 }
      );
    }
  })(request);
}
