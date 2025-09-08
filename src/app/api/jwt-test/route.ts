import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Test payload
    const testPayload = { 
      userId: 1, 
      email: 'test@example.com',
      role: 'user',
      timestamp: Date.now()
    };
    
    console.log('JWT Test: Creating token with payload:', testPayload);
    console.log('JWT Test: JWT_SECRET available:', !!JWT_SECRET);
    console.log('JWT Test: JWT_SECRET length:', JWT_SECRET.length);
    
    // Create token
    const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' });
    
    console.log('JWT Test: Token created:', !!token);
    console.log('JWT Test: Token length:', token.length);
    
    // Immediately verify the same token
    let verificationResult;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      verificationResult = {
        success: true,
        payload: decoded,
        userId: decoded.userId,
        email: decoded.email
      };
      console.log('JWT Test: Token verified successfully:', decoded.userId);
    } catch (verifyError) {
      verificationResult = {
        success: false,
        error: verifyError instanceof Error ? verifyError.message : 'Unknown error',
        errorType: verifyError?.constructor?.name
      };
      console.error('JWT Test: Token verification failed:', verifyError);
    }
    
    return NextResponse.json({
      test: 'jwt-creation-and-verification',
      environment: process.env.NODE_ENV,
      jwtSecretAvailable: !!JWT_SECRET,
      jwtSecretLength: JWT_SECRET.length,
      tokenCreated: !!token,
      tokenLength: token.length,
      tokenSample: token.substring(0, 50) + '...',
      verification: verificationResult,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('JWT Test error:', error);
    return NextResponse.json(
      { 
        error: 'JWT test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
