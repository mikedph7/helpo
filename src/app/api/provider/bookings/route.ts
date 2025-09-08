import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export const runtime = 'nodejs';

export const GET = requireRole('PROVIDER', async (req: NextRequest, user) => {
  try {
    // Find provider record linked to this user
    const provider = await prisma.provider.findFirst({
      where: { user_id: user.id }
    });

    if (!provider) {
      return NextResponse.json({ bookings: [] });
    }

    // Get query parameters for filtering
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    // Build where clause
    let where: any = { provider_id: provider.id };

    // Filter by status if provided
    if (status && ['pending', 'confirmed', 'completed', 'canceled'].includes(status)) {
      where.status = status;
    }

    // Search in service name or customer name/email
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
          user: {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            ]
          }
        }
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      select: {
        id: true,
        scheduled_at: true,
        status: true,
        total_price: true,
        location: true,
        notes: true,
        payment_status: true,
        provider_confirmed_at: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price_from: true,
            auto_confirm: true,
          },
        },
        time_slots: true,
        payments: {
          select: {
            id: true,
            status: true,
            payment_method: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    return NextResponse.json({ error: 'Failed to load provider bookings' }, { status: 500 });
  }
});
