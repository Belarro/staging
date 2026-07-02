import { NextRequest, NextResponse } from 'next/server';
import { fetchFromSupabase } from '@/lib/supabase';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Check if user exists in admin_users table
    let users;
    try {
      const query = `/admin_users?email=eq.${encodeURIComponent(email)}&select=id,email,password_hash`;
      console.log('Login query:', query, 'for email:', email);
      users = await fetchFromSupabase(query);
      console.log('Supabase response:', JSON.stringify(users));
    } catch (err) {
      console.error('Supabase query error:', err);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    if (!Array.isArray(users) || users.length === 0) {
      console.error('User not found. Email:', email, 'Response type:', typeof users, 'Is array:', Array.isArray(users), 'Length:', users?.length, 'Full response:', users);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session token and store in database
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Store session in database
    await fetchFromSupabase('/admin_sessions', {
      method: 'POST',
      body: JSON.stringify({
        user_id: user.id,
        token_hash: crypto.createHash('sha256').update(sessionToken).digest('hex'),
        expires_at: expiresAt,
      }),
    });

    const response = NextResponse.json({ success: true, user: { email } });

    response.cookies.set('belarro_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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
