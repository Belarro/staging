'use server';

import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt';
import { fetchFromSupabase } from '@/lib/supabase';
import { signSession } from '@/lib/session';

const PASSWORD_HASH_UPGRADE_ENABLED = true;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    const users = await fetchFromSupabase(
      `/admin_users?email=eq.${encodeURIComponent(email)}&select=id,email,password_hash`
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];
    const storedHash = user.password_hash;
    let isValid = false;

    // Try bcrypt first (if hash starts with $2)
    if (storedHash?.startsWith('$2')) {
      try {
        isValid = await bcrypt.compare(password, storedHash);
      } catch (err) {
        isValid = false;
      }
    } else {
      // Legacy row: password stored as plaintext — plain equality only.
      // On success the hash is upgraded to bcrypt below.
      isValid = typeof storedHash === 'string' && storedHash.length > 0 && storedHash === password;
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Auto-upgrade legacy hash if not bcrypt
    if (PASSWORD_HASH_UPGRADE_ENABLED && !storedHash?.startsWith('$2')) {
      const newHash = await bcrypt.hash(password, 10);
      await fetchFromSupabase(
        `/admin_users?id=eq.${user.id}`,
        { method: 'PATCH', body: JSON.stringify({ password_hash: newHash }) }
      ).catch(() => {}); // Silent fail, don't block login
    }

    const token = await signSession({ email, exp: Math.floor(Date.now() / 1000) + 86400 * 7 });
    const response = NextResponse.json({ success: true, user: { email } });

    response.cookies.set('belarro_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
