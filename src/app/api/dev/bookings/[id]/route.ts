import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WalletService } from "@/lib/wallet-service";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuth(async (_req, user) => {
    try {
      const { id } = await params;
      const bookingId = parseInt(id, 10);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

      const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId
      },
      include: {
        service: {
          include: {
            provider: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            payment_method: true,
            status: true,
            reference_number: true,
            proof_image_url: true,
            admin_notes: true,
            created_at: true,
            verified_at: true
          },
          orderBy: {
            created_at: 'desc'
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

      if (booking.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      return NextResponse.json(booking);
    } 
    catch (error) {
      console.error('Error fetching booking:', error);
      return NextResponse.json(
        { error: 'Failed to fetch booking' },
        { status: 500 }
      );
    }
  })(request);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuth(async (req, user) => {
    try {
      const { id } = await params;
      const bookingId = parseInt(id, 10);
      const body = await req.json();

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    // Check if booking exists (include service to read auto_confirm)
  const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          select: { auto_confirm: true }
        }
      }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (existingBooking.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update booking
    const updateData: any = { ...body };
    
    // Convert scheduled_at string to Date if present
    if (updateData.scheduled_at) {
      updateData.scheduled_at = new Date(updateData.scheduled_at);
    }

    // Business rule: If booking is confirmed AND service is not auto-confirm,
    // and user modifies key details, it requires provider re-approval.
    // We revert status to 'pending' on changes to schedule/location/notes.
    if (existingBooking.status === 'confirmed' && existingBooking.service && existingBooking.service.auto_confirm === false) {
      const scheduleChanged =
        updateData.scheduled_at instanceof Date &&
        existingBooking.scheduled_at &&
        updateData.scheduled_at.getTime() !== new Date(existingBooking.scheduled_at).getTime();

      const locationChanged =
        Object.prototype.hasOwnProperty.call(updateData, 'location') &&
        updateData.location !== existingBooking.location;

      const notesChanged =
        Object.prototype.hasOwnProperty.call(updateData, 'notes') &&
        updateData.notes !== existingBooking.notes;

      if (scheduleChanged || locationChanged || notesChanged) {
        updateData.status = 'pending';
      }
    }
    
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...updateData,
        updated_at: new Date()
      },
      include: {
        service: {
          include: {
            provider: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

      return NextResponse.json(updatedBooking);
    } catch (error) {
      console.error('Error updating booking:', error);
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }
  })(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuth(async (req, user) => {
    try {
      const { id } = await params;
      const bookingId = parseInt(id, 10);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    // Check if booking exists and get full booking data
  const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        user: true
      }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (existingBooking.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse cancellation data from request body
    let cancellationData = {};
    try {
      const body = await req.text();
      if (body) {
        cancellationData = JSON.parse(body);
      }
    } catch (error) {
      console.log('No cancellation data provided');
    }

    const { cancellation_reason, cancellation_details, cancelled_by } = cancellationData as {
      cancellation_reason?: string;
      cancellation_details?: string;
      cancelled_by?: 'customer' | 'provider';
    };

    // Check if refund is needed (provider cancellation and booking was paid)
    let refundResult = null;
    if (cancelled_by === 'provider' && 
        existingBooking.payment_status === 'paid' && 
        existingBooking.total_price > 0) {
      
      try {
        console.log(`Processing refund for booking ${bookingId}: ${existingBooking.total_price} cents to user ${existingBooking.user_id}`);
        
        refundResult = await WalletService.processRefund(
          existingBooking.user_id,
          existingBooking.total_price,
          bookingId,
          `Refund for cancelled booking: ${existingBooking.service?.name || 'Service'}`
        );
        
        console.log(`Refund processed successfully: ${JSON.stringify(refundResult)}`);
      } catch (refundError) {
        console.error('Refund processing failed:', refundError);
        // Continue with booking cancellation even if refund fails
        // The refund can be processed manually by admin
      }
    }

    // Cancel booking with cancellation data
    const cancelledBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'canceled',
        cancellation_reason,
        cancellation_details,
        canceled_at: new Date(),
        updated_at: new Date()
      }
    });

    const response: any = { 
      message: 'Booking canceled successfully',
      booking: cancelledBooking
    };

    // Include refund information in response if refund was processed
    if (refundResult) {
      response.refund = {
        amount_cents: existingBooking.total_price,
        refund_id: refundResult.refundId,
        user_balance: refundResult.userBalance
      };
    }

      return NextResponse.json(response);
    } catch (error) {
      console.error('Error deleting booking:', error);
      return NextResponse.json(
        { error: 'Failed to cancel booking' },
        { status: 500 }
      );
    }
  })(request);
}
