import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return requireAuth(async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const bookingId = searchParams.get('booking_id');
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'booking_id parameter is required' },
        { status: 400 }
      );
    }

    const bookingIdInt = parseInt(bookingId, 10);
    if (isNaN(bookingIdInt)) {
      return NextResponse.json(
        { error: 'Invalid booking_id' },
        { status: 400 }
      );
    }

    // Get booking with all related data
  const booking = await prisma.booking.findUnique({
      where: {
        id: bookingIdInt
      },
      include: {
        service: {
          include: {
            provider: true,
            reviews: {
              take: 5,
              orderBy: {
                created_at: 'desc'
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
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

    // Ownership check
    if (booking.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Format response with enhanced details
    const bookingDetails = {
      id: booking.id,
      status: booking.status,
      scheduled_at: booking.scheduled_at,
      location: booking.location,
      total_price: booking.total_price,
      notes: booking.notes,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      user: booking.user,
      service: {
        id: booking.service.id,
        name: booking.service.name,
        category: booking.service.category,
        description: booking.service.description,
        price_from: booking.service.price_from,
        duration_minutes: booking.service.duration_minutes,
        images: booking.service.images,
        provider: booking.service.provider ? {
          id: booking.service.provider.id,
          name: booking.service.provider.name,
          photo_url: booking.service.provider.photo_url,
          average_rating: booking.service.provider.average_rating,
          rating_count: booking.service.provider.rating_count,
          verified: booking.service.provider.verified,
          bio: booking.service.provider.bio,
          location: booking.service.provider.location
        } : null,
        recent_reviews: booking.service.reviews.slice(0, 3)
      },
      
      // Enhanced details
      policies: {
        cancellation: "Free cancellation up to 24 hours before service",
        rescheduling: "Free rescheduling up to 4 hours before service",
        payment: "Payment due after service completion"
      },
      
      available_actions: booking.status === 'confirmed' ? [
        'message_provider', 'reschedule', 'cancel'
      ] : booking.status === 'completed' ? [
        'leave_review', 'book_again'
      ] : []
    };

      return NextResponse.json(bookingDetails);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch booking details' },
        { status: 500 }
      );
    }
  })(request);
}
