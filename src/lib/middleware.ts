import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@/lib/rbac';

export function middleware(request: NextRequest) {
  const userRole = request.cookies.get('role')?.value as Role | undefined;

  if (!userRole) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Example: Restrict /admin to ADMIN role
  if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};