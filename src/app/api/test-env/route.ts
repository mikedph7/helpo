import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  
  return NextResponse.json({
    test: 'working',
    hasJwtSecret: !!JWT_SECRET,
    jwtSecretLength: JWT_SECRET.length,
    jwtSecretPrefix: JWT_SECRET.substring(0, 10) + '...',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
