import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'Auth debug endpoint',
      env_check: {
        jwt_secret_exists: !!process.env.JWT_SECRET,
        jwt_secret_length: process.env.JWT_SECRET?.length || 0,
        database_url_exists: !!process.env.DATABASE_URL,
        direct_url_exists: !!process.env.DIRECT_URL,
        node_env: process.env.NODE_ENV,
        vercel_region: process.env.VERCEL_REGION
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'Error in auth debug',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
