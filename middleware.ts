import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserByToken, hasRole } from '@/lib/auth-v2';

export function middleware(request: NextRequest) {
  const protectedRoutes = ['/admin', '/teacher', '/staff'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const user = getUserByToken(token);
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // 역할 기반 접근 제어
    if (request.nextUrl.pathname.startsWith('/admin') && !hasRole(user, 'admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    if (request.nextUrl.pathname.startsWith('/teacher') && !hasRole(user, 'teacher')) {
      return NextResponse.redirect(new URL('/staff', request.url));
    }
    
    if (request.nextUrl.pathname.startsWith('/staff') && user.role === 'teacher') {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
