import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id, 10);
    const body = await request.json();

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking
    const updateData = { ...body };
    
    // Convert scheduled_at string to Date if present
    if (updateData.scheduled_at) {
      updateData.scheduled_at = new Date(updateData.scheduled_at);
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
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id, 10);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Parse cancellation data from request body
    let cancellationData = {};
    try {
      const body = await request.text();
      if (body) {
        cancellationData = JSON.parse(body);
      }
    } catch (error) {
      console.log('No cancellation data provided');
    }

    const { cancellation_reason, cancellation_details } = cancellationData as {
      cancellation_reason?: string;
      cancellation_details?: string;
    };

    // Delete booking (or mark as canceled) with cancellation data
    const deletedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'canceled',
        cancellation_reason,
        cancellation_details,
        canceled_at: new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Booking canceled successfully',
      booking: deletedBooking
    });

  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
