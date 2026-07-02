import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { fetchFromSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
// import removed
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
export async function GET() {
import { requireAuth } from '@/lib/auth';
  try {
import { requireAuth } from '@/lib/auth';
    const auth = await requireAuth();
import { requireAuth } from '@/lib/auth';
    if (!auth.ok) return auth.response;
import { requireAuth } from '@/lib/auth';
    const data = await fetchFromSupabase('/products?order=sort_order.asc');
import { requireAuth } from '@/lib/auth';
    return NextResponse.json({ success: true, data: data || [] });
import { requireAuth } from '@/lib/auth';
  } catch (error) {
import { requireAuth } from '@/lib/auth';
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
import { requireAuth } from '@/lib/auth';
  }
import { requireAuth } from '@/lib/auth';
}
import { requireAuth } from '@/lib/auth';
