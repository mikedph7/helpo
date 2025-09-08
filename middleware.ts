import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  // Landing and auth pages
  '/',
  '/auth/login',
  '/auth/register',
  '/provider/auth/login',
  '/admin/auth/login',
  
  // Public content pages
  '/services',
  '/providers',
  '/saved',
  '/messages',
  '/bookings',
  '/profile',
  
  // Public API endpoints
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth-debug',
  '/api/env-check',
  '/api/dbcheck',
  '/api/debug-env',
  '/api/dev/services',
  '/api/dev/providers',
  '/api/dev/favorites',
  '/api/dev/reviews',
  '/api/dev/search',
  '/api/dev/locations',
  
  // Static and utility routes
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

// Define API routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/auth/me',
  '/api/auth/logout',
  '/api/dev/bookings',
  '/api/dev/users',
  '/api/dev/payments',
  '/api/dev/wallet',
  '/api/dev/profile',
];

// Pages that require authentication (not in PUBLIC_ROUTES):
// - /provider/* (provider dashboard, except login)
// - /admin/* (admin dashboard, except login)
// Note: /bookings and /profile are public but show different content based on auth status

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Redirect to appropriate login page based on route
    if (!pathname.startsWith('/api/')) {
      let loginUrl;
      if (pathname.startsWith('/provider')) {
        loginUrl = new URL('/provider/auth/login', request.url);
      } else if (pathname.startsWith('/admin')) {
        loginUrl = new URL('/admin/auth/login', request.url);
      } else {
        loginUrl = new URL('/auth/login', request.url);
      }
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Return 401 for API routes
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const role = decoded.role;
    
    // Enforce role-based access control
    if (pathname.startsWith('/provider') || pathname.startsWith('/api/provider')) {
      if (role !== 'PROVIDER') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }
        const loginUrl = new URL('/provider/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    
    // Enforce admin-only areas
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (role !== 'ADMIN') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }
        const loginUrl = new URL('/admin/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    
    // Add user info to request headers for API routes
  if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user-id', decoded.userId);
      requestHeaders.set('user-email', decoded.email);
      requestHeaders.set('user-role', role);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    return NextResponse.next();
  } catch (error) {
    // Invalid token - redirect to appropriate login page
    if (!pathname.startsWith('/api/')) {
      let loginUrl;
      if (pathname.startsWith('/provider')) {
        loginUrl = new URL('/provider/auth/login', request.url);
      } else if (pathname.startsWith('/admin')) {
        loginUrl = new URL('/admin/auth/login', request.url);
      } else {
        loginUrl = new URL('/auth/login', request.url);
      }
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
