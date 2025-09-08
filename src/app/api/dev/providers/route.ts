import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        services: {
          select: {
            id: true,
            name: true,
            category: true,
            price_from: true,
            verified: true,
            top_rated: true
          }
        },
        _count: {
          select: {
            services: true,
            bookings: true
          }
        }
      },
      orderBy: {
        average_rating: 'desc'
      }
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}
