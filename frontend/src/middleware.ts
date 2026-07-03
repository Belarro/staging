import { type NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

const PUBLIC_ROUTES = ['/login', '/'];
const PUBLIC_API = ['/api/auth/login', '/api/contact', '/api/website-leads', '/api/sync-sales-tracker', '/api/sync-prospect'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth required
  if (PUBLIC_ROUTES.includes(pathname) || PUBLIC_API.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('belarro_session')?.value;

  // Verify token
  const session = token ? verifySession(token) : null;

  // /admin/* pages require valid session
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // /api/* routes require valid session (except public endpoints)
  if (pathname.startsWith('/api/')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)',
  ],
};
