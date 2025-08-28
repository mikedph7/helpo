import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/dev/favorites - Get user's favorite services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('user_id') || '1'; // Default to user ID 1 for testing
    const userId = parseInt(userIdParam, 10);
    
    // Get user's favorites with service and provider details
    const favorites = await prisma.favorite.findMany({
      where: {
        user_id: userId
      },
      include: {
        service: {
          include: {
            provider: true,
            _count: {
              select: {
                bookings: true,
                favorites: true,
                reviews: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      favorites,
      count: favorites.length
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST /api/dev/favorites - Add service to favorites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, service_id } = body;

    if (!user_id || !service_id) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id and service_id' },
        { status: 400 }
      );
    }

    const userIdInt = parseInt(user_id, 10);
    const serviceIdInt = parseInt(service_id, 10);

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceIdInt }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        user_id_service_id: {
          user_id: userIdInt,
          service_id: serviceIdInt
        }
      }
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Service already in favorites' },
        { status: 409 }
      );
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        user_id: userIdInt,
        service_id: serviceIdInt
      },
      include: {
        service: {
          include: {
            provider: true
          }
        }
      }
    });

    return NextResponse.json(favorite, { status: 201 });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

// DELETE /api/dev/favorites - Remove service from favorites
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const service_id = searchParams.get('service_id');

    if (!user_id || !service_id) {
      return NextResponse.json(
        { error: 'Missing required parameters: user_id and service_id' },
        { status: 400 }
      );
    }

    const userIdInt = parseInt(user_id, 10);
    const serviceIdInt = parseInt(service_id, 10);

    // Find and delete the favorite
    const favorite = await prisma.favorite.findUnique({
      where: {
        user_id_service_id: {
          user_id: userIdInt,
          service_id: serviceIdInt
        }
      }
    });

    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    await prisma.favorite.delete({
      where: {
        user_id_service_id: {
          user_id: userIdInt,
          service_id: serviceIdInt
        }
      }
    });

    return NextResponse.json({ message: 'Removed from favorites' });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}
