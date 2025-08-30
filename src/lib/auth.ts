import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  name: string | null;
}

export async function authenticate(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Optional: Check if session exists in database (for better security)
    const prisma = new PrismaClient();
    const session = await prisma.session.findFirst({
      where: {
        token: token,
        user_id: decoded.userId,
        expires_at: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    await prisma.$disconnect();

    if (!session) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      name: session.user.name
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

export function requireRole(role: string, handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== role) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(request, user);
  };
}
