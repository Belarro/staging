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
    try {
import { requireAuth } from '@/lib/auth';
      const [seeds, packages, samples, crops, variants] = await Promise.all([
import { requireAuth } from '@/lib/auth';
        fetchFromSupabase('/belarro_v4_seed_inventory?select=*'),
import { requireAuth } from '@/lib/auth';
        fetchFromSupabase('/belarro_v4_package_inventory?select=*'),
import { requireAuth } from '@/lib/auth';
        fetchFromSupabase('/belarro_v4_sample_inventory?select=*'),
import { requireAuth } from '@/lib/auth';
        fetchFromSupabase('/belarro_v4_crop?select=id,name_en,name_de'),
import { requireAuth } from '@/lib/auth';
        fetchFromSupabase('/belarro_v4_product_variant?select=id,size_name,crop_id')
import { requireAuth } from '@/lib/auth';
      ]);
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
      const cropMap = new Map<string, any>((crops || []).map((c: any) => [c.id, c]));
import { requireAuth } from '@/lib/auth';
      const varMap = new Map<string, any>((variants || []).map((v: any) => [v.id, v]));
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
      const hydratedSeeds = (seeds || []).map((s: any) => ({
import { requireAuth } from '@/lib/auth';
        ...s,
import { requireAuth } from '@/lib/auth';
        crop: cropMap.get(s.crop_id) || { name_en: 'Unknown Crop' }
import { requireAuth } from '@/lib/auth';
      }));
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
      const hydratedPackages = (packages || []).map((p: any) => {
import { requireAuth } from '@/lib/auth';
        const variant = varMap.get(p.variant_id);
import { requireAuth } from '@/lib/auth';
        const crop = variant ? cropMap.get(variant.crop_id) : null;
import { requireAuth } from '@/lib/auth';
        return {
import { requireAuth } from '@/lib/auth';
          ...p,
import { requireAuth } from '@/lib/auth';
          variant: variant ? { ...variant, crop } : null
import { requireAuth } from '@/lib/auth';
        };
import { requireAuth } from '@/lib/auth';
      });
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
      const hydratedSamples = (samples || []).map((s: any) => ({
import { requireAuth } from '@/lib/auth';
        ...s,
import { requireAuth } from '@/lib/auth';
        crop: cropMap.get(s.crop_id) || { name_en: 'Unknown Crop' }
import { requireAuth } from '@/lib/auth';
      }));
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
      return NextResponse.json({
import { requireAuth } from '@/lib/auth';
        success: true,
import { requireAuth } from '@/lib/auth';
        data: {
import { requireAuth } from '@/lib/auth';
          seeds: hydratedSeeds,
import { requireAuth } from '@/lib/auth';
          packages: hydratedPackages,
import { requireAuth } from '@/lib/auth';
          samples: hydratedSamples
import { requireAuth } from '@/lib/auth';
        }
import { requireAuth } from '@/lib/auth';
      });
import { requireAuth } from '@/lib/auth';
    } catch (dbErr) {
import { requireAuth } from '@/lib/auth';
      console.warn('Database inventory not ready, using mocks');
import { requireAuth } from '@/lib/auth';
      return NextResponse.json({
import { requireAuth } from '@/lib/auth';
        success: true,
import { requireAuth } from '@/lib/auth';
        data: {
import { requireAuth } from '@/lib/auth';
          seeds: [
import { requireAuth } from '@/lib/auth';
            { id: 'mock-s1', crop_id: 'mock-c1', quantity_grams: 800, reorder_threshold_trays: 10, crop: { name_en: 'Broccoli', name_de: 'Brokkoli' } },
import { requireAuth } from '@/lib/auth';
            { id: 'mock-s2', crop_id: 'mock-c2', quantity_grams: 120, reorder_threshold_trays: 20, crop: { name_en: 'Radish', name_de: 'Rettich' } }
import { requireAuth } from '@/lib/auth';
          ],
import { requireAuth } from '@/lib/auth';
          packages: [
import { requireAuth } from '@/lib/auth';
            { id: 'mock-p1', variant_id: 'mock-v1', quantity_available: 45, reorder_threshold: 20, variant: { size_name: '100g Bag', crop: { name_en: 'Broccoli' } } }
import { requireAuth } from '@/lib/auth';
          ],
import { requireAuth } from '@/lib/auth';
          samples: [
import { requireAuth } from '@/lib/auth';
            { id: 'mock-sa1', crop_id: 'mock-c1', available_grams: 150, crop: { name_en: 'Broccoli' } }
import { requireAuth } from '@/lib/auth';
          ]
import { requireAuth } from '@/lib/auth';
        }
import { requireAuth } from '@/lib/auth';
      });
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';
  } catch (error) {
import { requireAuth } from '@/lib/auth';
    console.error('Inventory GET error:', error);
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

import { requireAuth } from '@/lib/auth';
export async function POST(request: NextRequest) {
import { requireAuth } from '@/lib/auth';
  try {
import { requireAuth } from '@/lib/auth';
    const auth = await requireAuth();
import { requireAuth } from '@/lib/auth';
    if (!auth.ok) return auth.response;
import { requireAuth } from '@/lib/auth';
    const body = await request.json();
import { requireAuth } from '@/lib/auth';
    const { crop_id, quantity_grams, seeds_per_tray, reorder_threshold_trays } = body;
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    if (!crop_id || quantity_grams === undefined || !seeds_per_tray) {
import { requireAuth } from '@/lib/auth';
      return NextResponse.json({ success: false, error: 'crop_id, quantity_grams, and seeds_per_tray are required' }, { status: 400 });
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const existing = await fetchFromSupabase(`/belarro_v4_seed_inventory?crop_id=eq.${crop_id}&select=id`);
import { requireAuth } from '@/lib/auth';
    if (existing && existing.length > 0) {
import { requireAuth } from '@/lib/auth';
      // Update existing record
import { requireAuth } from '@/lib/auth';
      const updated = await fetchFromSupabase(`/belarro_v4_seed_inventory?id=eq.${existing[0].id}`, {
import { requireAuth } from '@/lib/auth';
        method: 'PATCH',
import { requireAuth } from '@/lib/auth';
        body: JSON.stringify({
import { requireAuth } from '@/lib/auth';
          quantity_grams: parseFloat(quantity_grams),
import { requireAuth } from '@/lib/auth';
          seeds_per_tray: parseFloat(seeds_per_tray),
import { requireAuth } from '@/lib/auth';
          reorder_threshold_trays: parseInt(reorder_threshold_trays) || 20,
import { requireAuth } from '@/lib/auth';
          updated_at: new Date().toISOString()
import { requireAuth } from '@/lib/auth';
        })
import { requireAuth } from '@/lib/auth';
      });
import { requireAuth } from '@/lib/auth';
      return NextResponse.json({ success: true, data: updated?.[0], message: 'Seed stock updated' });
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const newRecord = await fetchFromSupabase('/belarro_v4_seed_inventory', {
import { requireAuth } from '@/lib/auth';
      method: 'POST',
import { requireAuth } from '@/lib/auth';
      body: JSON.stringify({
import { requireAuth } from '@/lib/auth';
        id: crypto.randomUUID(),
import { requireAuth } from '@/lib/auth';
        crop_id,
import { requireAuth } from '@/lib/auth';
        quantity_grams: parseFloat(quantity_grams),
import { requireAuth } from '@/lib/auth';
        seeds_per_tray: parseFloat(seeds_per_tray),
import { requireAuth } from '@/lib/auth';
        reorder_threshold_trays: parseInt(reorder_threshold_trays) || 20,
import { requireAuth } from '@/lib/auth';
      })
import { requireAuth } from '@/lib/auth';
    });
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    return NextResponse.json({ success: true, data: newRecord?.[0], message: 'Seed stock created' });
import { requireAuth } from '@/lib/auth';
  } catch (error) {
import { requireAuth } from '@/lib/auth';
    console.error('Inventory POST error:', error);
import { requireAuth } from '@/lib/auth';
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
import { requireAuth } from '@/lib/auth';
  }
import { requireAuth } from '@/lib/auth';
}
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
export async function DELETE(request: NextRequest) {
import { requireAuth } from '@/lib/auth';
  try {
import { requireAuth } from '@/lib/auth';
    const auth = await requireAuth();
import { requireAuth } from '@/lib/auth';
    if (!auth.ok) return auth.response;
import { requireAuth } from '@/lib/auth';
    const { type, id } = await request.json();
import { requireAuth } from '@/lib/auth';
    if (!type || !id) return NextResponse.json({ success: false, error: 'type and id required' }, { status: 400 });
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    let table = '';
import { requireAuth } from '@/lib/auth';
    if (type === 'seeds') table = '/belarro_v4_seed_inventory';
import { requireAuth } from '@/lib/auth';
    else if (type === 'samples') table = '/belarro_v4_sample_inventory';
import { requireAuth } from '@/lib/auth';
    else return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    await fetchFromSupabase(`${table}?id=eq.${id}`, { method: 'DELETE' });
import { requireAuth } from '@/lib/auth';
    return NextResponse.json({ success: true });
import { requireAuth } from '@/lib/auth';
  } catch (error) {
import { requireAuth } from '@/lib/auth';
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
import { requireAuth } from '@/lib/auth';
  }
import { requireAuth } from '@/lib/auth';
}
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
export async function PUT(request: NextRequest) {
import { requireAuth } from '@/lib/auth';
  try {
import { requireAuth } from '@/lib/auth';
    const auth = await requireAuth();
import { requireAuth } from '@/lib/auth';
    if (!auth.ok) return auth.response;
import { requireAuth } from '@/lib/auth';
    const body = await request.json();
import { requireAuth } from '@/lib/auth';
    const { type, id, quantity } = body; // type is 'seeds' | 'packages' | 'samples'
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    if (!type || !id || quantity === undefined) {
import { requireAuth } from '@/lib/auth';
      return NextResponse.json({ success: false, error: 'type, id, and quantity are required' }, { status: 400 });
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    let table = '';
import { requireAuth } from '@/lib/auth';
    let updateField = '';
import { requireAuth } from '@/lib/auth';
    
import { requireAuth } from '@/lib/auth';
    if (type === 'seeds') {
import { requireAuth } from '@/lib/auth';
      table = '/belarro_v4_seed_inventory';
import { requireAuth } from '@/lib/auth';
      updateField = 'quantity_grams';
import { requireAuth } from '@/lib/auth';
    } else if (type === 'packages') {
import { requireAuth } from '@/lib/auth';
      table = '/belarro_v4_package_inventory';
import { requireAuth } from '@/lib/auth';
      updateField = 'quantity_available';
import { requireAuth } from '@/lib/auth';
    } else if (type === 'samples') {
import { requireAuth } from '@/lib/auth';
      table = '/belarro_v4_sample_inventory';
import { requireAuth } from '@/lib/auth';
      updateField = 'available_grams';
import { requireAuth } from '@/lib/auth';
    } else {
import { requireAuth } from '@/lib/auth';
      return NextResponse.json({ success: false, error: 'Invalid inventory type' }, { status: 400 });
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const updated = await fetchFromSupabase(`${table}?id=eq.${id}`, {
import { requireAuth } from '@/lib/auth';
      method: 'PATCH',
import { requireAuth } from '@/lib/auth';
      body: JSON.stringify({
import { requireAuth } from '@/lib/auth';
        [updateField]: parseFloat(quantity),
import { requireAuth } from '@/lib/auth';
        updated_at: new Date().toISOString()
import { requireAuth } from '@/lib/auth';
      })
import { requireAuth } from '@/lib/auth';
    });
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    return NextResponse.json({
import { requireAuth } from '@/lib/auth';
      success: true,
import { requireAuth } from '@/lib/auth';
      data: updated ? updated[0] : null,
import { requireAuth } from '@/lib/auth';
      message: 'Inventory updated successfully'
import { requireAuth } from '@/lib/auth';
    });
import { requireAuth } from '@/lib/auth';
  } catch (error) {
import { requireAuth } from '@/lib/auth';
    console.error('Inventory PUT error:', error);
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
