import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('user_id') || '1'; // Default to user ID 1 for testing
    const userId = parseInt(userIdParam, 10);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Build where clause
    const where: any = {
      user_id: userId
    };
    
    // Filter by booking status if provided
    if (status) {
      const now = new Date();
      
      switch (status) {
        case 'upcoming':
          where.AND = [
            { scheduled_at: { gte: now } },
            { status: { in: ['pending', 'confirmed'] } }
          ];
          break;
        case 'past':
          where.OR = [
            { scheduled_at: { lt: now } },
            { status: 'completed' }
          ];
          break;
        case 'canceled':
          where.status = 'canceled';
          break;
        default:
          if (['pending', 'confirmed', 'completed', 'canceled'].includes(status)) {
            where.status = status;
          }
      }
    }
    
    // Text search in service name or provider name
    if (search) {
      where.OR = [
        {
          service: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          provider: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // Fetch bookings from database
    const bookings = await prisma.booking.findMany({
      where,
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
      },
      orderBy: {
        scheduled_at: 'desc'
      }
    });

    return NextResponse.json({
      bookings,
      count: bookings.length,
      filters: {
        userId,
        status,
        search
      }
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, service_id, provider_id, scheduled_at, location, notes } = body;

    // Validate required fields
    if (!user_id || !service_id || !provider_id || !scheduled_at) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: service_id },
      include: { provider: true }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Ensure user exists (create test user if needed)
    let user = await prisma.user.findUnique({
      where: { id: user_id }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: user_id,
          name: 'Test User',
          email: 'test@example.com'
        }
      });
    }

    // Create new booking
    const booking = await prisma.booking.create({
      data: {
        user_id,
        service_id,
        provider_id,
        scheduled_at: new Date(scheduled_at),
        location,
        notes,
        status: 'pending',
        total_price: service.price_from || 0
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

    return NextResponse.json(booking, { status: 201 });

  } catch (error) {
    console.error('Error creating booking:', error);
    // Return more detailed error information for debugging
    return NextResponse.json(
      { 
        error: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
