import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('service_id');
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    let whereClause: any = {};

    if (serviceId) {
      whereClause.service_id = parseInt(serviceId, 10);
    }

    if (userId) {
      whereClause.user_id = parseInt(userId, 10);
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
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
            avatar: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit
    });

    return NextResponse.json({
      reviews,
      count: reviews.length
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, service_id, rating, comment, name, avatar_url } = body;

    if (!service_id || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields: service_id, rating, comment' },
        { status: 400 }
      );
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: parseInt(service_id, 10) }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        user_id: user_id ? parseInt(user_id, 10) : null,
        service_id: parseInt(service_id, 10),
        rating: parseInt(rating, 10),
        comment,
        name: name || 'Anonymous',
        avatar_url
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
            avatar: true
          }
        }
      }
    });

    return NextResponse.json(review, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
