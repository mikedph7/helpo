// src/app/api/dev/search/popular/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const popularSearches = [
    {
      term: 'Aircon Cleaning',
      category: 'Cleaning',
      count: 1250
    },
    {
      term: 'House Cleaning',
      category: 'Cleaning', 
      count: 980
    },
    {
      term: 'Dog Walking',
      category: 'Pets',
      count: 750
    },
    {
      term: 'Piano Tutor',
      category: 'Lessons',
      count: 650
    },
    {
      term: 'Plumbing Repair',
      category: 'Repair',
      count: 580
    },
    {
      term: 'Deep Cleaning',
      category: 'Cleaning',
      count: 520
    },
    {
      term: 'Pet Sitting',
      category: 'Pets',
      count: 480
    },
    {
      term: 'Math Tutor',
      category: 'Lessons',
      count: 420
    }
  ];

  return NextResponse.json(popularSearches);
}
