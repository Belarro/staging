import { NextRequest, NextResponse } from 'next/server';
import { fetchFromSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get all crops
    const crops = await fetchFromSupabase(
      `/belarro_v4_crop?deleted_at=is.null&select=id,name_en`
    );

    const results = [];

    for (const crop of crops) {
      // Check if procedure exists
      const existing = await fetchFromSupabase(
        `/belarro_v4_growth_procedure?crop_id=eq.${crop.id}&select=id`
      );

      if (!existing || existing.length === 0) {
        // Create default procedure
        const res = await fetchFromSupabase(
          `/belarro_v4_growth_procedure`,
          {
            method: 'POST',
            body: JSON.stringify({
              crop_id: crop.id,
              soak_enabled: false,
              soak_hours: null,
              cover_soil_enabled: false,
              stack_enabled: false,
              stack_days: null,
              light_enabled: true,
              light_days: 7,
              blackout_enabled: false,
              blackout_days: null,
              humidity_dome_enabled: false,
              humidity_dome_days: null,
            }),
          }
        );
        results.push({ crop: crop.name_en, status: 'created' });
      } else {
        results.push({ crop: crop.name_en, status: 'exists' });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
