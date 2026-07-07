import { type NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

const PUBLIC_ROUTES = ['/login', '/'];
// send-followup-email is whitelisted here but does its own auth inside the
// route (admin session cookie OR x-sync-secret) so the SalesTracker phone
// app can call it cross-origin without a browser session.
// NOTE: /api/website-leads is admin-only (lists/edits lead PII) — the public
// website submits through /api/contact, which creates the lead row itself.
const PUBLIC_API = ['/api/auth/login', '/api/contact', '/api/sync-sales-tracker', '/api/sync-prospect', '/api/send-followup-email'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth required
  if (PUBLIC_ROUTES.includes(pathname) || PUBLIC_API.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('belarro_session')?.value;

  // Verify token (await for async Web Crypto)
  const session = token ? await verifySession(token) : null;

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
