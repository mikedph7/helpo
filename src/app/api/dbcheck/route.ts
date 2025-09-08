import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('Database check endpoint called');
    
    // Parse the DATABASE_URL to extract host without exposing the full URL
    const databaseUrl = process.env.DATABASE_URL;
    let hostInfo = 'Not available';
    
    if (databaseUrl) {
      try {
        const url = new URL(databaseUrl);
        hostInfo = `${url.hostname}:${url.port}`;
      } catch (e) {
        hostInfo = 'Invalid URL format';
      }
    }
    
    console.log(`Attempting connection to host: ${hostInfo}`);
    
    // Test database connectivity with a simple query
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as postgres_version`;
    
    console.log('Database connection successful:', result);
    
    return NextResponse.json({ 
      success: true, 
      host: hostInfo,
      timestamp: new Date().toISOString(),
      result: result
    });
    
  } catch (error) {
    console.error('Database check failed:', error);
    
    // Parse the DATABASE_URL to extract host without exposing secrets
    const databaseUrl = process.env.DATABASE_URL;
    let hostInfo = 'Not available';
    
    if (databaseUrl) {
      try {
        const url = new URL(databaseUrl);
        hostInfo = `${url.hostname}:${url.port}`;
      } catch (e) {
        hostInfo = 'Invalid URL format';
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      host: hostInfo,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
