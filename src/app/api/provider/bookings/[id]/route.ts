import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(
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

      // Get booking with all related data, ensuring it belongs to this provider
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          provider_id: provider.id
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              duration_minutes: true,
              images: true,
              auto_confirm: true
            }
          }
        }
      });

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(booking);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch booking details' },
        { status: 500 }
      );
    }
  })(request);
}
