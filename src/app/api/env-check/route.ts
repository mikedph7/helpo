import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Simple connectivity test without Prisma
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
      status: 'Environment check passed',
      host: hostInfo,
      timestamp: new Date().toISOString(),
      env_vars: {
        database_url_exists: !!process.env.DATABASE_URL,
        direct_url_exists: !!process.env.DIRECT_URL,
        vercel_region: process.env.VERCEL_REGION,
        node_env: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    return NextResponse.json({ 
      status: 'Environment check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
