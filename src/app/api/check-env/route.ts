import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  
  return NextResponse.json({
    hasJwtSecret: !!process.env.JWT_SECRET,
    isUsingDefault: JWT_SECRET === 'your-secret-key',
    secretLength: JWT_SECRET.length,
    secretPrefix: JWT_SECRET.substring(0, 8) + '...',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
