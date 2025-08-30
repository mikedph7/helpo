import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type City = {
  id: number;
  name: string;
  region: string;
  province: string | null;
  created_at: Date;
  updated_at: Date;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const search = searchParams.get('search');

    let cities: City[];

    if (search) {
      // Search cities by name
      cities = await prisma.city.findMany({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        orderBy: [
          { region: 'asc' },
          { name: 'asc' },
        ],
        take: 20,
      });
    } else if (region) {
      // Filter by region
      cities = await prisma.city.findMany({
        where: { region },
        orderBy: { name: 'asc' },
      });
    } else {
      // Get all cities, prioritizing NCR
      cities = await prisma.city.findMany({
        orderBy: [
          { region: 'asc' },
          { name: 'asc' },
        ],
      });
    }

    // Group cities by region for better organization
    const groupedCities = cities.reduce((acc: Record<string, City[]>, city: City) => {
      const region = city.region;
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(city);
      return acc;
    }, {});

    return NextResponse.json({
      cities,
      grouped: groupedCities,
      count: cities.length,
    });
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}
