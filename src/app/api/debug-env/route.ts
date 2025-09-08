import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  
  return NextResponse.json({
    hasJwtSecret: !!process.env.JWT_SECRET,
    secretLength: JWT_SECRET.length,
    secretStart: JWT_SECRET.substring(0, 10) + '...',
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('JWT') || key.includes('SECRET'))
  });
}
