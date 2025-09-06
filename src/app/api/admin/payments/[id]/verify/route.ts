import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

// POST /api/admin/payments/[id]/verify - Admin verifies payment
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    const resolvedParams = await params;
    const paymentId = parseInt(resolvedParams.id);
    const { action, admin_notes } = await request.json(); // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            notes: true,
            provider_confirmed_at: true,
            service: {
              select: {
                auto_confirm: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'pending') {
      return NextResponse.json({ error: 'Payment already processed' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      if (action === 'approve') {
        // Update payment status to verified
        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: 'paid', // Maps to 'verified' in new system
            verified_by: user.id,
            verified_at: new Date(),
            admin_notes: admin_notes || 'Payment verified by admin'
          }
        });

        // Update booking payment status and determine booking status
        if (payment.booking) {
          let newBookingStatus: 'pending' | 'confirmed' = payment.booking.status as 'pending' | 'confirmed';
          
          if (payment.booking.service.auto_confirm) {
            // Auto-confirm services: payment verified → immediately confirmed
            newBookingStatus = 'confirmed';
          } else {
            // Manual approval services: check if provider already approved
            const hasProviderApproval = !!payment.booking.provider_confirmed_at;
            
            if (hasProviderApproval) {
              // Provider already approved + payment verified = confirmed
              newBookingStatus = 'confirmed';
            } else {
              // Payment verified but provider hasn't approved yet = stay pending
              newBookingStatus = 'pending';
            }
          }

          const updatedBooking = await tx.booking.update({
            where: { id: payment.booking.id },
            data: { 
              status: newBookingStatus,
              payment_status: 'paid' // Update payment status to paid
            }
          });

          return { payment: updatedPayment, booking: updatedBooking };
        }

        return { payment: updatedPayment };
      } else {
        // Reject payment
        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: 'failed', // Maps to 'rejected' in new system
            verified_by: user.id,
            verified_at: new Date(),
            admin_notes: admin_notes || 'Payment proof rejected - please resubmit with valid proof'
          }
        });

        // Update booking payment status to failed so customer can resubmit
        if (payment.booking) {
          await tx.booking.update({
            where: { id: payment.booking.id },
            data: { payment_status: 'failed' }
          });
        }

        return { payment: updatedPayment };
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing payment verification:', error);
    return NextResponse.json(
      { error: 'Failed to process payment verification' },
      { status: 500 }
    );
  }
}
