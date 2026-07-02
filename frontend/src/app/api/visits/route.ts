import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { fetchFromSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
// import removed
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
export async function GET(request: NextRequest) {
import { requireAuth } from '@/lib/auth';
  try {
import { requireAuth } from '@/lib/auth';
    const auth = await requireAuth();
import { requireAuth } from '@/lib/auth';
    if (!auth.ok) return auth.response;
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    // Fetch all non-archived locations sorted by visit date
import { requireAuth } from '@/lib/auth';
    const locations = await fetchFromSupabase(
import { requireAuth } from '@/lib/auth';
      '/locations?select=id,location_name,contact_person,direct_phone,business_phone,direct_email,visit_notes,pipeline_stage,interest_level,timestamp,created_at,sales_rep&order=timestamp.desc.nullslast&limit=500'
import { requireAuth } from '@/lib/auth';
    );
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    console.log('Visits API — locations raw count:', Array.isArray(locations) ? locations.length : locations);
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const visits = (locations || []).map((loc: any) => ({
import { requireAuth } from '@/lib/auth';
      location_id: loc.id,
import { requireAuth } from '@/lib/auth';
      restaurant_name: loc.location_name,
import { requireAuth } from '@/lib/auth';
      contact_person: loc.contact_person || null,
import { requireAuth } from '@/lib/auth';
      phone: loc.direct_phone || loc.business_phone || null,
import { requireAuth } from '@/lib/auth';
      email: loc.direct_email || null,
import { requireAuth } from '@/lib/auth';
      visited_at: loc.timestamp,
import { requireAuth } from '@/lib/auth';
      notes: loc.visit_notes || null,
import { requireAuth } from '@/lib/auth';
      interest_level: loc.interest_level || null,
import { requireAuth } from '@/lib/auth';
      pipeline_stage: loc.pipeline_stage || null,
import { requireAuth } from '@/lib/auth';
      sales_rep: loc.sales_rep || null,
import { requireAuth } from '@/lib/auth';
    }));
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    return NextResponse.json({ success: true, data: visits });
import { requireAuth } from '@/lib/auth';
  } catch (error) {
import { requireAuth } from '@/lib/auth';
    console.error('Visits GET error:', error);
import { requireAuth } from '@/lib/auth';
    return NextResponse.json(
import { requireAuth } from '@/lib/auth';
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
import { requireAuth } from '@/lib/auth';
      { status: 500 }
import { requireAuth } from '@/lib/auth';
    );
import { requireAuth } from '@/lib/auth';
  }
import { requireAuth } from '@/lib/auth';
}
import { requireAuth } from '@/lib/auth';
