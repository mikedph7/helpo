import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const serviceId = parseInt(id);
    
    if (isNaN(serviceId)) {
      return NextResponse.json({ error: 'Invalid service ID' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        provider: true,
        bookings: {
          select: {
            id: true,
            status: true,
            scheduled_at: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        favorites: {
          select: {
            id: true,
            user_id: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            bookings: true,
            favorites: true,
            reviews: true
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Transform the data to match expected format
    const transformedService = {
      id: service.id,
      name: service.name,
      category: service.category,
      description: service.description,
      price_from: service.price_from,
      duration_minutes: service.duration_minutes,
      tags: service.tags,
      images: service.images,
      what_included: service.what_included,
      requirements: service.requirements,
      pricing_details: service.pricing_details,
      top_rated: service.top_rated,
      verified: service.verified,
      next_availability: service.next_availability,
      created_at: service.created_at,
      updated_at: service.updated_at,
      provider_id: service.provider_id,
      provider: service.provider ? {
        id: service.provider.id,
        name: service.provider.name,
        bio: service.provider.bio,
        average_rating: service.provider.average_rating,
        rating_count: service.provider.rating_count,
        photo_url: service.provider.photo_url,
        verified: service.provider.verified,
        location: service.provider.location,
        created_at: service.provider.created_at,
        updated_at: service.provider.updated_at
      } : null,
      bookings: service.bookings.map((booking: any) => ({
        id: booking.id,
        status: booking.status,
        scheduled_at: booking.scheduled_at,
        user: booking.user
      })),
      reviews: service.reviews.map((review: any) => ({
        id: review.id,
        name: review.name,
        avatar_url: review.avatar_url,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        user: review.user
      })),
      stats: {
        booking_count: service._count.bookings,
        favorite_count: service._count.favorites,
        review_count: service._count.reviews
      }
    };

    return NextResponse.json(transformedService);

  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}
