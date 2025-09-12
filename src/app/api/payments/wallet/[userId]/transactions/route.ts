import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Authenticate the request
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId: userIdParam } = await params;
    const userId = parseInt(userIdParam);
    
    // Verify user is accessing their own transactions or is admin
    if (user.id !== userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch recent wallet transactions
    const transactions = await prisma.walletTransaction.findMany({
      where: {
        user_id: userId
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        amount: true,
        transaction_type: true,
        description: true,
        reference_id: true,
        balance_before: true,
        balance_after: true,
        created_at: true
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.walletTransaction.count({
      where: {
        user_id: userId
      }
    });

    return NextResponse.json({
      transactions,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet transactions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
