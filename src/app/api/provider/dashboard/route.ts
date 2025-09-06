import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export const GET = requireRole('PROVIDER', async (req: NextRequest, user) => {
  try {
    // Find provider record linked to this user
    const provider = await prisma.provider.findFirst({
      where: { user_id: user.id }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Get booking statistics
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      canceledBookings,
      upcomingBookings,
      recentBookings
    ] = await Promise.all([
      prisma.booking.count({ where: { provider_id: provider.id } }),
      prisma.booking.count({ where: { provider_id: provider.id, status: 'pending' } }),
      prisma.booking.count({ where: { provider_id: provider.id, status: 'confirmed' } }),
      prisma.booking.count({ where: { provider_id: provider.id, status: 'completed' } }),
      prisma.booking.count({ where: { provider_id: provider.id, status: 'canceled' } }),
      prisma.booking.count({ 
        where: { 
          provider_id: provider.id, 
          status: { in: ['confirmed', 'pending'] },
          scheduled_at: { gte: new Date() }
        } 
      }),
      prisma.booking.findMany({
        where: { provider_id: provider.id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, name: true } }
        },
        orderBy: { created_at: 'desc' },
        take: 5
      })
    ]);

    // Calculate earnings (completed bookings)
    const completedBookingsWithEarnings = await prisma.booking.findMany({
      where: { 
        provider_id: provider.id, 
        status: 'completed',
        payment_status: 'paid'
      },
      select: { total_price: true }
    });

    const totalEarnings = completedBookingsWithEarnings.reduce((sum, booking) => sum + booking.total_price, 0);

    // Get bookings that need provider approval:
    // 1. Status is pending
    // 2. Payment is verified (paid)  
    // 3. Service has auto_confirm = false
    // 4. Provider hasn't approved yet (no approval note)
    const pendingBookingsForActions = await prisma.booking.findMany({
      where: { 
        provider_id: provider.id, 
        status: 'pending',
        payment_status: 'paid', // Payment already verified
        service: {
          auto_confirm: false // Only non-auto-confirm services need approval
        },
        // Exclude bookings where provider already approved
        provider_confirmed_at: null
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, name: true, auto_confirm: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    // Get service statistics
    const serviceStats = await prisma.service.findMany({
      where: { provider_id: provider.id },
      select: {
        id: true,
        name: true,
        auto_confirm: true,
        _count: {
          select: {
            bookings: true
          }
        }
      }
    });

    return NextResponse.json({
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        canceledBookings,
        upcomingBookings,
        totalEarnings,
        totalServices: serviceStats.length
      },
      recentBookings,
      pendingActions: pendingBookingsForActions,
      serviceStats,
      provider: {
        id: provider.id,
        name: provider.name,
        average_rating: provider.average_rating,
        rating_count: provider.rating_count,
        verified: provider.verified
      }
    });

  } catch (error) {
    console.error('Error fetching provider dashboard:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
});
