import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;


  const isPublicRoute = pathname === '/login' || 
                        pathname === '/registro' || 
                        pathname === '/';


  if (isPublicRoute) {
    return NextResponse.next();
  }

 
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/registro',
  ],
};