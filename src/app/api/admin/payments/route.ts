import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('Admin payments route hit');
    
    // Check authentication
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    // Fetch payments pending verification, excluding payments for cancelled bookings
    const payments = await prisma.payment.findMany({
      where: {
        status: 'pending',
        proof_image_url: { not: null },
        // Exclude payments for cancelled bookings
        OR: [
          { booking_id: null }, // Wallet reloads (no booking)
          {
            booking: {
              status: {
                not: 'canceled' // Exclude cancelled bookings
              }
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        booking: {
          select: {
            id: true,
            scheduled_at: true,
            location: true,
            notes: true,
            status: true,
            total_price: true,
            created_at: true,
            service: {
              select: {
                id: true,
                name: true,
                description: true,
                auto_confirm: true,
                duration_minutes: true,
                category: true
              }
            },
            provider: {
              select: {
                id: true,
                name: true,
                photo_url: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    console.log(`Found ${payments.length} pending payments for verification`);
    
    // Transform the response to match frontend interface
    const transformedPayments = payments.map(payment => ({
      ...payment,
      payment_proof_url: payment.proof_image_url
    }));
    
    return NextResponse.json(transformedPayments);
  } catch (error) {
    console.error('Error in admin payments route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
