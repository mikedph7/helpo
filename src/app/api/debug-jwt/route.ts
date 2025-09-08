import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    const debug: any = {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPrefix: token ? token.substring(0, 20) + '...' : 'N/A',
      hasJwtSecret: !!JWT_SECRET,
      jwtSecretLength: JWT_SECRET.length,
      jwtSecretPrefix: JWT_SECRET.substring(0, 10) + '...',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    // Try to decode the token if it exists
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        debug.tokenValid = true;
        debug.tokenPayload = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          iat: decoded.iat,
          exp: decoded.exp
        };
      } catch (error) {
        debug.tokenValid = false;
        debug.tokenError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    return NextResponse.json({ debug });

  } catch (error) {
    console.error('Debug JWT error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
