import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WalletService } from "@/lib/wallet-service";
import { requireRole } from "@/lib/auth";

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

      // Get booking and verify ownership
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

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      // Only confirmed bookings can be canceled by provider
      if (booking.status !== 'confirmed') {
        return NextResponse.json(
          { error: 'Only confirmed bookings can be canceled' },
          { status: 400 }
        );
      }

      // Update booking status to canceled
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'canceled',
          cancellation_reason: reason || 'Canceled by provider',
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

      // Process refund to customer wallet since provider canceled
      if (booking.payment_status === 'paid' && booking.total_price > 0) {
        try {
          await WalletService.processRefund(
            booking.user_id!,
            booking.total_price,
            booking.id,
            reason || 'Canceled by provider'
          );
        } catch (refundError) {
          console.error('Failed to process refund:', refundError);
          // Continue with booking cancellation even if refund fails
          // This should be handled by a background job or manual process
        }
      }

      return NextResponse.json(updatedBooking);
    } catch (error) {
      console.error('Error canceling booking:', error);
      return NextResponse.json(
        { error: 'Failed to cancel booking' },
        { status: 500 }
      );
    }
  })(request);
}
