import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return requireAuth(async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const userId = user.id;
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
        },
        payments: {
          select: {
            status: true
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        scheduled_at: 'desc'
      }
    });

      return NextResponse.json({
        bookings: bookings.map(booking => ({
          ...booking,
          payment_status: booking.payments[0]?.status || 'unpaid'
        })),
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
  })(request);
}

export async function POST(request: NextRequest) {
  return requireAuth(async (req, user) => {
    try {
      const body = await req.json();
      const { service_id, provider_id, scheduled_at, location, notes, status, payment_id } = body;

    // Validate required fields
  if (!service_id || !provider_id || !scheduled_at) {
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

    // Enforce payment-first: require an already-paid payment record tied to user, or reject
    if (!payment_id) {
      return NextResponse.json(
        { error: 'Payment required before creating booking' },
        { status: 400 }
      );
    }

  const payment = await prisma.payment.findUnique({ where: { id: payment_id } });
  if (!payment || payment.user_id !== user.id || payment.status !== 'paid' || payment.payment_type !== 'booking') {
      return NextResponse.json(
        { error: 'Invalid or unpaid payment' },
        { status: 400 }
      );
    }

    // Determine booking status based on service auto_confirm
    const bookingStatus = service.auto_confirm ? 'confirmed' : 'pending';

  // User is authenticated; no auto-create

    // Create new booking
  const booking = await prisma.booking.create({
      data: {
    user_id: user.id,
        service_id,
        provider_id,
        scheduled_at: new Date(scheduled_at),
        location,
        notes,
        status: bookingStatus,
        total_price: service.price_from || 0,
        payment_status: 'paid'
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

    // Link payment to booking now
    await prisma.payment.update({
      where: { id: payment.id },
      data: { booking_id: booking.id }
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
  })(request);
}
