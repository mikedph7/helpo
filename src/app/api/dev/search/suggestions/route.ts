// src/app/api/dev/search/suggestions/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { SERVICES, PROVIDERS } from '../../_data/services';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = new Set<string>();

  // Get service name suggestions
  SERVICES.forEach(service => {
    if (service.name.toLowerCase().includes(query)) {
      suggestions.add(service.name);
    }
  });

  // Get provider name suggestions
  PROVIDERS.forEach(provider => {
    if (provider.display_name.toLowerCase().includes(query)) {
      suggestions.add(provider.display_name);
    }
  });

  // Get category suggestions
  const categories = ['Home Care', 'Fix It', 'Pet Care', 'Learn'];
  categories.forEach(category => {
    if (category.toLowerCase().includes(query)) {
      suggestions.add(category);
    }
  });

  // Get popular search terms
  const popularTerms = [
    'aircon cleaning',
    'house cleaning',
    'deep cleaning',
    'plumbing repair',
    'electrical repair',
    'dog walking',
    'pet sitting',
    'piano lessons',
    'cooking classes',
    'math tutor',
    'guitar lessons'
  ];

  popularTerms.forEach(term => {
    if (term.toLowerCase().includes(query)) {
      suggestions.add(term);
    }
  });

  return NextResponse.json({
    suggestions: Array.from(suggestions).slice(0, limit)
  });
}
