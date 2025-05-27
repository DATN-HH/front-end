import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Middleware disabled for UI testing
  // Uncomment the code below to re-enable authentication
  
  /*
  // Check if user is accessing dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for authentication token
    const token = request.cookies.get('auth-token')?.value
    
    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  */

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Middleware disabled - no routes are protected
     * Uncomment to re-enable: '/dashboard/:path*'
     */
  ],
} 