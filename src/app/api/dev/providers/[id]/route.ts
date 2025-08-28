import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const providerId = parseInt(id);
    
    if (isNaN(providerId)) {
      return NextResponse.json({ error: 'Invalid provider ID' }, { status: 400 });
    }

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        services: {
          include: {
            _count: {
              select: {
                bookings: true,
                favorites: true,
                reviews: true
              }
            }
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            scheduled_at: true,
            service: {
              select: {
                id: true,
                name: true
              }
            },
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            services: true,
            bookings: true
          }
        }
      }
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider' },
      { status: 500 }
    );
  }
}
