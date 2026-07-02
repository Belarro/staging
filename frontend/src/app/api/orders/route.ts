import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { fetchFromSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
// import removed
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
// Helper: Calculate seeding date based on schedule
import { requireAuth } from '@/lib/auth';
const calculateSeedingDate = (orderDate: Date, schedule: string = 'FRIDAY'): Date => {
import { requireAuth } from '@/lib/auth';
  const date = new Date(orderDate);
import { requireAuth } from '@/lib/auth';
  const dayOfWeek = date.getDay(); // 0=Sunday, 2=Tuesday, 5=Friday
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
  const targetDay = schedule === 'TUESDAY' ? 2 : 5;
import { requireAuth } from '@/lib/auth';
  
import { requireAuth } from '@/lib/auth';
  if (dayOfWeek === targetDay) {
import { requireAuth } from '@/lib/auth';
    return date;
import { requireAuth } from '@/lib/auth';
  }
import { requireAuth } from '@/lib/auth';
  
import { requireAuth } from '@/lib/auth';
  const diff = (targetDay + 7 - dayOfWeek) % 7;
import { requireAuth } from '@/lib/auth';
  const result = new Date(date);
import { requireAuth } from '@/lib/auth';
  result.setDate(result.getDate() + diff);
import { requireAuth } from '@/lib/auth';
  return result;
import { requireAuth } from '@/lib/auth';
};
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
// Helper: Calculate next delivery date (Saturday following harvest)
import { requireAuth } from '@/lib/auth';
const calculateNextDeliveryDate = (harvestDate: Date): Date => {
import { requireAuth } from '@/lib/auth';
  const result = new Date(harvestDate);
import { requireAuth } from '@/lib/auth';
  const dayOfWeek = result.getDay(); // 0=Sunday, 6=Saturday
import { requireAuth } from '@/lib/auth';
  
import { requireAuth } from '@/lib/auth';
  const diff = (6 + 7 - dayOfWeek) % 7;
import { requireAuth } from '@/lib/auth';
  result.setDate(result.getDate() + diff);
import { requireAuth } from '@/lib/auth';
  return result;
import { requireAuth } from '@/lib/auth';
};
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
    const { searchParams } = new URL(request.url);
import { requireAuth } from '@/lib/auth';
    const customerId = searchParams.get('customer_id');
import { requireAuth } from '@/lib/auth';
    const status = searchParams.get('status');
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    let path = '/belarro_v4_order?deleted_at=is.null&select=*&order=created_at.desc';
import { requireAuth } from '@/lib/auth';
    if (customerId) {
import { requireAuth } from '@/lib/auth';
      path = `/belarro_v4_order?deleted_at=is.null&customer_id=eq.${customerId}&select=*&order=created_at.desc`;
import { requireAuth } from '@/lib/auth';
    } else if (status) {
import { requireAuth } from '@/lib/auth';
      path = `/belarro_v4_order?deleted_at=is.null&status=eq.${status}&select=*&order=created_at.desc`;
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    try {
import { requireAuth } from '@/lib/auth';
      const orders = await fetchFromSupabase(path);
import { requireAuth } from '@/lib/auth';
      const ords = orders || [];
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
      // Hydrate with Customer and Variant
import { requireAuth } from '@/lib/auth';
      const [customers, variants, crops] = await Promise.all([
import { requireAuth } from '@/lib/auth';
        fetchFromSupabase('/belarro_v4_customer?select=id,name,email,restaurant_name'),
import { requireAuth } from '@/lib/auth';
        fetchFromSupabase('/belarro_v4_product_variant?select=*'),
import { requireAuth } from '@/lib/auth';
        fetchFromSupabase('/belarro_v4_crop?select=id,name_en,name_de')
import { requireAuth } from '@/lib/auth';
      ]);
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
      const custMap = new Map<string, any>((customers || []).map((c: any) => [c.id, c]));
import { requireAuth } from '@/lib/auth';
      const varMap = new Map<string, any>((variants || []).map((v: any) => [v.id, v]));
import { requireAuth } from '@/lib/auth';
      const cropMap = new Map<string, any>((crops || []).map((c: any) => [c.id, c]));
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
      const hydrated = ords.map((o: any) => {
import { requireAuth } from '@/lib/auth';
        const variant = varMap.get(o.product_variant_id);
import { requireAuth } from '@/lib/auth';
        let crop = null;
import { requireAuth } from '@/lib/auth';
        if (variant) {
import { requireAuth } from '@/lib/auth';
          crop = cropMap.get(variant.crop_id);
import { requireAuth } from '@/lib/auth';
        }
import { requireAuth } from '@/lib/auth';
        return {
import { requireAuth } from '@/lib/auth';
          ...o,
import { requireAuth } from '@/lib/auth';
          customer: custMap.get(o.customer_id) || { name: 'Unknown Customer' },
import { requireAuth } from '@/lib/auth';
          variant: variant ? {
import { requireAuth } from '@/lib/auth';
            ...variant,
import { requireAuth } from '@/lib/auth';
            crop: crop || { name_en: 'Unknown Crop', name_de: 'Unbekannt' }
import { requireAuth } from '@/lib/auth';
          } : null
import { requireAuth } from '@/lib/auth';
        };
import { requireAuth } from '@/lib/auth';
      });
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
      return NextResponse.json({
import { requireAuth } from '@/lib/auth';
        success: true,
import { requireAuth } from '@/lib/auth';
        data: hydrated
import { requireAuth } from '@/lib/auth';
      });
import { requireAuth } from '@/lib/auth';
    } catch (dbErr) {
import { requireAuth } from '@/lib/auth';
      console.warn('Database tables not ready, returning mock orders');
import { requireAuth } from '@/lib/auth';
      return NextResponse.json({
import { requireAuth } from '@/lib/auth';
        success: true,
import { requireAuth } from '@/lib/auth';
        data: [
import { requireAuth } from '@/lib/auth';
          {
import { requireAuth } from '@/lib/auth';
            id: 'mock-o1',
import { requireAuth } from '@/lib/auth';
            customer_id: 'mock-c1',
import { requireAuth } from '@/lib/auth';
            product_variant_id: 'mock-v1',
import { requireAuth } from '@/lib/auth';
            quantity: 5,
import { requireAuth } from '@/lib/auth';
            order_date: new Date().toISOString(),
import { requireAuth } from '@/lib/auth';
            expected_harvest_date: new Date().toISOString(),
import { requireAuth } from '@/lib/auth';
            next_delivery_date: new Date().toISOString(),
import { requireAuth } from '@/lib/auth';
            status: 'growing',
import { requireAuth } from '@/lib/auth';
            recurring: true,
import { requireAuth } from '@/lib/auth';
            customer: { name: 'Chefs Table' },
import { requireAuth } from '@/lib/auth';
            variant: { size_name: '100g Bag', price_eur: 6.50, crop: { name_en: 'Broccoli', name_de: 'Brokkoli' } }
import { requireAuth } from '@/lib/auth';
          }
import { requireAuth } from '@/lib/auth';
        ]
import { requireAuth } from '@/lib/auth';
      });
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';
  } catch (error) {
import { requireAuth } from '@/lib/auth';
    console.error('Orders GET error:', error);
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
    const { customer_id, product_variant_id, quantity, recurring, frequency } = body;
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    if (!customer_id || !product_variant_id || quantity === undefined) {
import { requireAuth } from '@/lib/auth';
      return NextResponse.json(
import { requireAuth } from '@/lib/auth';
        { success: false, error: 'customer_id, product_variant_id, and quantity are required' },
import { requireAuth } from '@/lib/auth';
        { status: 400 }
import { requireAuth } from '@/lib/auth';
      );
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    // Get variant
import { requireAuth } from '@/lib/auth';
    const variant = await fetchFromSupabase(`/belarro_v4_product_variant?id=eq.${product_variant_id}&select=*`);
import { requireAuth } from '@/lib/auth';
    if (!variant || variant.length === 0) {
import { requireAuth } from '@/lib/auth';
      return NextResponse.json({ success: false, error: 'Product variant not found' }, { status: 404 });
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';
    const variantData = variant[0];
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    // Get growth procedure to calculate total growth days
import { requireAuth } from '@/lib/auth';
    const procedure = await fetchFromSupabase(`/belarro_v4_growth_procedure?crop_id=eq.${variantData.crop_id}&select=*`);
import { requireAuth } from '@/lib/auth';
    
import { requireAuth } from '@/lib/auth';
    let growthDays = 10; // Default fallback
import { requireAuth } from '@/lib/auth';
    if (procedure && procedure.length > 0) {
import { requireAuth } from '@/lib/auth';
      const p = procedure[0];
import { requireAuth } from '@/lib/auth';
      const lightsDays = p.light_enabled ? (p.light_days || 0) : 0;
import { requireAuth } from '@/lib/auth';
      let envDays = 0;
import { requireAuth } from '@/lib/auth';
      if (lightsDays > 0) {
import { requireAuth } from '@/lib/auth';
        envDays = lightsDays;
import { requireAuth } from '@/lib/auth';
      } else if (p.blackout_enabled && p.blackout_days) {
import { requireAuth } from '@/lib/auth';
        envDays = p.blackout_days;
import { requireAuth } from '@/lib/auth';
      } else {
import { requireAuth } from '@/lib/auth';
        envDays = p.growth_env_days || 0;
import { requireAuth } from '@/lib/auth';
      }
import { requireAuth } from '@/lib/auth';
      growthDays = (p.stack_enabled ? (p.stack_days || 0) : 0) + envDays;
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const orderDate = new Date();
import { requireAuth } from '@/lib/auth';
    // Default schedule to Friday for now
import { requireAuth } from '@/lib/auth';
    const seedingDate = calculateSeedingDate(orderDate, 'FRIDAY');
import { requireAuth } from '@/lib/auth';
    const harvestDate = new Date(seedingDate);
import { requireAuth } from '@/lib/auth';
    harvestDate.setDate(harvestDate.getDate() + growthDays);
import { requireAuth } from '@/lib/auth';
    const nextDeliveryDate = calculateNextDeliveryDate(harvestDate);
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const orderId = crypto.randomUUID();
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const newOrder = await fetchFromSupabase('/belarro_v4_order', {
import { requireAuth } from '@/lib/auth';
      method: 'POST',
import { requireAuth } from '@/lib/auth';
      body: JSON.stringify({
import { requireAuth } from '@/lib/auth';
        id: orderId,
import { requireAuth } from '@/lib/auth';
        customer_id,
import { requireAuth } from '@/lib/auth';
        product_variant_id,
import { requireAuth } from '@/lib/auth';
        quantity: parseFloat(quantity),
import { requireAuth } from '@/lib/auth';
        order_date: orderDate.toISOString(),
import { requireAuth } from '@/lib/auth';
        expected_harvest_date: harvestDate.toISOString(),
import { requireAuth } from '@/lib/auth';
        next_delivery_date: nextDeliveryDate.toISOString(),
import { requireAuth } from '@/lib/auth';
        status: 'active',
import { requireAuth } from '@/lib/auth';
        recurring: true,
import { requireAuth } from '@/lib/auth';
        frequency: frequency === 'biweekly' ? 'biweekly' : 'weekly'
import { requireAuth } from '@/lib/auth';
      })
import { requireAuth } from '@/lib/auth';
    });
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    // Attempt to deduct from seed inventory (if it exists)
import { requireAuth } from '@/lib/auth';
    try {
import { requireAuth } from '@/lib/auth';
      const seedInv = await fetchFromSupabase(`/belarro_v4_seed_inventory?crop_id=eq.${variantData.crop_id}&select=*`);
import { requireAuth } from '@/lib/auth';
      if (seedInv && seedInv.length > 0) {
import { requireAuth } from '@/lib/auth';
        const inv = seedInv[0];
import { requireAuth } from '@/lib/auth';
        const seedsNeeded = parseFloat(quantity) * 60; // 60g per tray default
import { requireAuth } from '@/lib/auth';
        await fetchFromSupabase(`/belarro_v4_seed_inventory?id=eq.${inv.id}`, {
import { requireAuth } from '@/lib/auth';
          method: 'PATCH',
import { requireAuth } from '@/lib/auth';
          body: JSON.stringify({
import { requireAuth } from '@/lib/auth';
            quantity_grams: Math.max(0, inv.quantity_grams - seedsNeeded)
import { requireAuth } from '@/lib/auth';
          })
import { requireAuth } from '@/lib/auth';
        });
import { requireAuth } from '@/lib/auth';
      }
import { requireAuth } from '@/lib/auth';
    } catch (invErr) {
import { requireAuth } from '@/lib/auth';
      console.warn('Inventory deduction skipped:', invErr);
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    return NextResponse.json({
import { requireAuth } from '@/lib/auth';
      success: true,
import { requireAuth } from '@/lib/auth';
      data: newOrder ? newOrder[0] : { id: orderId, customer_id, product_variant_id, quantity },
import { requireAuth } from '@/lib/auth';
      message: 'Order created successfully'
import { requireAuth } from '@/lib/auth';
    });
import { requireAuth } from '@/lib/auth';
  } catch (error) {
import { requireAuth } from '@/lib/auth';
    console.error('Order POST error:', error);
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
