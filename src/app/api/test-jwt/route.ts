import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  
  try {
    // Create a test token
    const testPayload = { userId: 999, email: 'test@test.com', role: 'USER', iat: Math.floor(Date.now() / 1000) };
    const testToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' });
    
    // Try to verify the same token
    const verified = jwt.verify(testToken, JWT_SECRET) as any;
    
    return NextResponse.json({
      success: true,
      canCreateAndVerify: true,
      testPayload,
      verifiedPayload: verified,
      secretInfo: {
        hasSecret: !!process.env.JWT_SECRET,
        secretLength: JWT_SECRET.length,
        secretStart: JWT_SECRET.substring(0, 10) + '...'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      secretInfo: {
        hasSecret: !!process.env.JWT_SECRET,
        secretLength: JWT_SECRET.length,
        secretStart: JWT_SECRET.substring(0, 10) + '...'
      }
    });
  }
}
§