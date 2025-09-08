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
        
        // Try to decode without verification to see the payload
        try {
          const decodedUnsafe = jwt.decode(token) as any;
          debug.tokenPayloadUnsafe = decodedUnsafe;
        } catch (decodeError) {
          debug.tokenDecodeError = decodeError instanceof Error ? decodeError.message : 'Decode failed';
        }
      }
    }

    // Also test creating a simple token to see if JWT creation works
    try {
      const testToken = jwt.sign({ test: 'data', iat: Math.floor(Date.now() / 1000) }, JWT_SECRET);
      debug.canCreateToken = true;
      debug.testTokenLength = testToken.length;
      
      // Try to verify the test token immediately
      const verifiedTest = jwt.verify(testToken, JWT_SECRET) as any;
      debug.canVerifyOwnToken = true;
    } catch (error) {
      debug.canCreateToken = false;
      debug.tokenCreationError = error instanceof Error ? error.message : 'Token creation failed';
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
