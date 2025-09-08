import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';

// POST /api/reviews - Submit a review for a completed booking
export async function POST(request: NextRequest) {
  return requireAuth(async (_req, user) => {
    try {
      const { booking_id, rating, comment } = await request.json();

      if (!booking_id || !rating || rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Missing required fields. booking_id and rating (1-5) are required.' },
          { status: 400 }
        );
      }

      if (!comment || comment.trim().length < 10) {
        return NextResponse.json(
          { error: 'Review comment must be at least 10 characters long.' },
          { status: 400 }
        );
      }

      // Get booking details and verify it belongs to the user and is completed
      const booking = await prisma.booking.findUnique({
        where: { id: booking_id },
        include: {
          service: true,
          user: true
        }
      });

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      // Verify the user owns this booking
      if (booking.user_id !== user.id) {
        return NextResponse.json(
          { error: 'You can only review your own bookings' },
          { status: 403 }
        );
      }

      // Check if booking is completed
      if (booking.status !== 'completed') {
        return NextResponse.json(
          { error: 'You can only review completed bookings' },
          { status: 400 }
        );
      }

      // Check if review already exists for this booking
      const existingReview = await prisma.review.findFirst({
        where: { 
          user_id: user.id,
          service_id: booking.service_id 
        }
      });

      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this service' },
          { status: 400 }
        );
      }

      // Get user details for avatar
      const userDetails = await prisma.user.findUnique({
        where: { id: user.id },
        select: { avatar: true }
      });

      // Create the review
      const review = await prisma.review.create({
        data: {
          name: user.name || 'Anonymous',
          avatar_url: userDetails?.avatar,
          rating: parseInt(rating),
          comment: comment.trim(),
          user_id: user.id,
          service_id: booking.service_id
        }
      });

      return NextResponse.json({
        message: 'Review submitted successfully',
        review: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          user: {
            id: user.id,
            name: user.name
          },
          service: {
            id: booking.service_id,
            name: booking.service.name
          }
        }
      });

    } catch (error) {
      console.error('Error submitting review:', error);
      return NextResponse.json(
        { error: 'Failed to submit review' },
        { status: 500 }
      );
    }
  })(request);
}

// GET /api/reviews - Get reviews (with optional service filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service_id = searchParams.get('service_id');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = service_id ? { service_id: parseInt(service_id) } : {};

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        service: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.review.count({ where });

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
