// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define routes that need a wallet connection
  const protectedRoutes = ['/balance-manager', '/play'];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // If not a protected route, continue.
  if (!isProtected) {
    return NextResponse.next();
  }

  // Check if a wallet connection cookie exists.
  const walletConnected = req.cookies.get('walletConnected');

  // If connected, allow access.
  if (walletConnected) {
    return NextResponse.next();
  }

  // Otherwise, redirect to the login page with the intended route.
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = '/connect';
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/play/:path*'],
};
