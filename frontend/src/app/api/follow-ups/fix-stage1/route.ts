import { NextResponse } from 'next/server';
import { fetchFromSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function POST() {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const now = new Date().toISOString();

    // Find all stage-1 pending rows where due_date is in the future
    const stuckRows = await fetchFromSupabase(
      `/belarro_v4_follow_up?stage=eq.1&status=eq.pending&due_date=gt.${now}&select=id`
    );

    if (!stuckRows || stuckRows.length === 0) {
      return NextResponse.json({ success: true, fixed: 0 });
    }

    // Update each one to now
    for (const row of stuckRows) {
      await fetchFromSupabase(`/belarro_v4_follow_up?id=eq.${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ due_date: now }),
      });
    }

    return NextResponse.json({ success: true, fixed: stuckRows.length });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
