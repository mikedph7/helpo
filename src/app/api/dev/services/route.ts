import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const query = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category') || '';
    const location = searchParams.get('location')?.toLowerCase() || '';
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause for filtering
    const where: any = {};
    
    // Text search in name and description
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    // Category filter
    if (category) {
      where.category = category;
    }
    
    // Location filter (search in provider location)
    if (location) {
      where.provider = {
        location: {
          contains: location,
          mode: 'insensitive'
        }
      };
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'price_low':
        orderBy = { price_from: 'asc' };
        break;
      case 'price_high':
        orderBy = { price_from: 'desc' };
        break;
      case 'rating':
        orderBy = { provider: { average_rating: 'desc' } };
        break;
      case 'newest':
        orderBy = { created_at: 'desc' };
        break;
      default:
        orderBy = { created_at: 'desc' };
    }

    // Fetch services from database
    const services = await prisma.service.findMany({
      where,
      include: {
        provider: true,
        _count: {
          select: {
            bookings: true,
            favorites: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.service.count({ where });

    // Transform the data to match the expected frontend format
    const transformedServices = services.map((service: any) => ({
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
      booking_count: service._count.bookings,
      favorite_count: service._count.favorites
    }));

    return NextResponse.json({
      services: transformedServices,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      filters: {
        query,
        category,
        location,
        sortBy
      }
    });

  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
