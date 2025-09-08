import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  try {
    // Get token from cookie or Authorization header
    console.log('Auth/me: Token received:', !!token);
    console.log('Auth/me: JWT_SECRET available:', !!JWT_SECRET);

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('Auth/me: Token decoded successfully:', decoded.userId);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        email_verified: true,
        phone: true,
        phone_verified: true,
        created_at: true
      }
    });

    console.log('Auth/me: User found:', !!user);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT Error details:', {
        name: error.name,
        message: error.message,
        tokenReceived: !!token
      });
      return NextResponse.json(
        { error: 'Invalid token', details: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
