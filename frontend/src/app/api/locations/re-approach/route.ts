import { NextRequest, NextResponse } from 'next/server';
import { fetchFromSupabase } from '@/lib/supabase';
// import removed

const OLD_LEAD_DAYS = 30;

function isOldLead(timestamp: string | null, createdAt: string | null): boolean {
  const dateStr = timestamp || createdAt;
  if (!dateStr) return true;
  const cleaned = String(dateStr).trim()
    .replace(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/, '$3-$2-$1')
    .replace(' ', 'T');
  const date = new Date(cleaned);
  if (isNaN(date.getTime())) return true;
  return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24) > OLD_LEAD_DAYS;
}

// New-lead: 5 stages at 2h/2d/5d/14d/30d. Re-engage: 4 stages at 2h/2d/5d/30d
// — the 14-day stage is dropped entirely. Same tables as seed-followups and
// follow-ups POST, kept in sync intentionally (see FOLLOWUP_COPY_V2.md).
const NEW_STAGES = [
  { stage: 1, follow_up_number: 1, follow_up_days: 0,  offset: 2 * 60 * 60 * 1000 },
  { stage: 2, follow_up_number: 2, follow_up_days: 2,  offset: 2  * 24 * 60 * 60 * 1000 },
  { stage: 3, follow_up_number: 3, follow_up_days: 5,  offset: 5  * 24 * 60 * 60 * 1000 },
  { stage: 4, follow_up_number: 4, follow_up_days: 14, offset: 14 * 24 * 60 * 60 * 1000 },
  { stage: 5, follow_up_number: 5, follow_up_days: 30, offset: 30 * 24 * 60 * 60 * 1000 },
];
const REENGAGE_STAGES = [
  { stage: 1, follow_up_number: 1, follow_up_days: 0,  offset: 2 * 60 * 60 * 1000 },
  { stage: 2, follow_up_number: 2, follow_up_days: 2,  offset: 2  * 24 * 60 * 60 * 1000 },
  { stage: 3, follow_up_number: 3, follow_up_days: 5,  offset: 5  * 24 * 60 * 60 * 1000 },
  { stage: 4, follow_up_number: 4, follow_up_days: 30, offset: 30 * 24 * 60 * 60 * 1000 },
];

// "Not interested" is a soft pause, not a permanent close (see
// FOLLOWUP_NOT_INTERESTED_FIX.md — Ron wants a manual Seasonal-List style
// re-approach later, not a closed_lost). This clears pipeline_stage back to
// null so STOPPED_STAGES no longer filters the location, then re-seeds the
// follow-up sequence exactly like a fresh visit would.
export async function POST(request: NextRequest) {
  try {
    // auth handled by middleware
    // if (!auth.ok) return auth.response;
    const { location_id } = await request.json();
    if (!location_id) return NextResponse.json({ success: false, error: 'location_id required' }, { status: 400 });

    const locRows = await fetchFromSupabase(
      `/locations?id=eq.${location_id}&select=id,timestamp,created_at`
    );
    if (!locRows || locRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 });
    }
    const loc = locRows[0];

    // 1. Clear pipeline_stage back to null (out of STOPPED_STAGES)
    await fetchFromSupabase(`/locations?id=eq.${location_id}`, {
      method: 'PATCH',
      body: JSON.stringify({ pipeline_stage: null, updated_at: new Date().toISOString() }),
    });

    // 2. Clean up any stale follow-up rows from the previous cycle so we
    // don't end up with duplicate stage numbers for the same location.
    await fetchFromSupabase(`/belarro_v4_follow_up?location_id=eq.${location_id}&status=eq.pending`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'skipped', updated_at: new Date().toISOString() }),
    });

    // 3. Re-seed follow-ups from now (re-approach = treated as a fresh touch)
    const base = Date.now();
    const old = isOldLead(loc.timestamp, loc.created_at);
    const stages = old ? REENGAGE_STAGES : NEW_STAGES;

    for (const s of stages) {
      await fetchFromSupabase('/belarro_v4_follow_up', {
        method: 'POST',
        body: JSON.stringify({
          id: crypto.randomUUID(),
          location_id,
          follow_up_number: s.follow_up_number,
          follow_up_days: s.follow_up_days,
          stage: s.stage,
          due_date: new Date(base + s.offset).toISOString(),
          status: 'pending',
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Re-approach error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
