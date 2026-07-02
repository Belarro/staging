import { type NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { fetchFromSupabase } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and public routes
  if (pathname === '/login' || pathname === '/' || pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/test')) {
    return NextResponse.next();
  }

  // Check for session cookie on protected routes
  const sessionToken = request.cookies.get('belarro_session')?.value;

  if (!sessionToken) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Validate session token in database
  try {
    const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
    const sessions = await fetchFromSupabase(
      `/admin_sessions?token_hash=eq.${encodeURIComponent(tokenHash)}&expires_at=gt.now&select=id,expires_at`
    );

    if (!Array.isArray(sessions) || sessions.length === 0) {
      // Invalid or expired session
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  } catch (error) {
    console.error('Session validation error:', error);
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)',
  ],
};
