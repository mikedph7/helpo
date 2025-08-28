// src/app/api/dev/search/analytics/route.ts
import { NextResponse, NextRequest } from 'next/server';

// In a real app, this would connect to a database
const searchLogs: Array<{
  id: string;
  query: string;
  category?: string;
  location?: string;
  timestamp: string;
  results_count: number;
  user_clicked?: boolean;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, category, location, results_count, user_clicked = false } = body;

    const logEntry = {
      id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query,
      category,
      location,
      timestamp: new Date().toISOString(),
      results_count,
      user_clicked
    };

    // In a real app, save to database
    searchLogs.push(logEntry);

    return NextResponse.json({ success: true, id: logEntry.id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to log search analytics' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Get recent search trends
  const recentSearches = searchLogs.slice(-50);
  
  // Calculate popular terms
  const termCounts: Record<string, number> = {};
  recentSearches.forEach(log => {
    if (log.query) {
      termCounts[log.query.toLowerCase()] = (termCounts[log.query.toLowerCase()] || 0) + 1;
    }
  });

  const popularTerms = Object.entries(termCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([term, count]) => ({ term, count }));

  return NextResponse.json({
    total_searches: searchLogs.length,
    recent_searches: recentSearches.length,
    popular_terms: popularTerms
  });
}
