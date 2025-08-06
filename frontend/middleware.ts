import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ADMIN AUTH DISABLED FOR TESTING - always allow admin routes
export function middleware(request: NextRequest) {
  // Always allow all /admin routes for testing
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
};
