import { NextRequest, NextResponse } from 'next/server';
import { fetchFromSupabase } from '@/lib/supabase';

const SYNC_SECRET = process.env.SALETRACKER_SYNC_SECRET || '';

/**
 * POST /api/deliveries/confirm
 * body: { order_id, delivery_date (YYYY-MM-DD), status: 'delivered'|'adjusted'|'not_delivered',
 *         actual_qty?, note?, confirmed_by? }
 *
 * Writes ONE immutable ledger row per (order_id, delivery_date). This is the
 * ground truth for "what actually happened" — invoices and past-month
 * reporting read this table, never the live order config, so editing an
 * order today can't rewrite history. Re-confirming the same line/week
 * upserts (a correction), it does not duplicate (unique constraint on the
 * table handles this via PostgREST's on_conflict).
 *
 * Auth: admin session cookie (browser) OR x-sync-secret header (Sales Tracker
 * app — same shared-secret pattern as /api/sync-sales-tracker).
 */
export async function POST(request: NextRequest) {
  try {
    const headerSecret = request.headers.get('x-sync-secret');
    const hasSecret = !!SYNC_SECRET && headerSecret === SYNC_SECRET;
    if (!hasSecret && !request.cookies.get('belarro_session')?.value) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, delivery_date, status, actual_qty, note, confirmed_by } = body;

    if (!order_id || !delivery_date || !status) {
      return NextResponse.json(
        { success: false, error: 'order_id, delivery_date, and status are required' },
        { status: 400 }
      );
    }
    if (!['delivered', 'adjusted', 'not_delivered'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const order = await fetchFromSupabase(`/belarro_v4_order?id=eq.${order_id}&select=*`);
    if (!order || order.length === 0) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    const orderData = order[0];

    const [variant, customer] = await Promise.all([
      fetchFromSupabase(`/belarro_v4_product_variant?id=eq.${orderData.product_variant_id}&select=*`),
      fetchFromSupabase(`/belarro_v4_customer?id=eq.${orderData.customer_id}&select=id`),
    ]);
    const variantData = variant?.[0];
    if (!customer || customer.length === 0) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }
    let cropName = 'Unknown';
    if (variantData) {
      const crop = await fetchFromSupabase(`/belarro_v4_crop?id=eq.${variantData.crop_id}&select=name_en`);
      if (crop && crop.length > 0) cropName = crop[0].name_en;
    }

    const expectedQty = orderData.quantity || 1;
    const resolvedActualQty = status === 'not_delivered' ? 0 : (actual_qty !== undefined && actual_qty !== null ? Number(actual_qty) : expectedQty);

    const row = {
      order_id,
      customer_id: orderData.customer_id,
      delivery_date,
      crop_name: cropName,
      size_name: variantData?.size_name || null,
      expected_qty: expectedQty,
      actual_qty: resolvedActualQty,
      unit_price_eur: variantData?.price_eur ?? 0,
      status,
      note: note || null,
      confirmed_by: confirmed_by || null,
      confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Upsert on (order_id, delivery_date) — a correction replaces, never duplicates.
    const existing = await fetchFromSupabase(
      `/belarro_v4_delivery?order_id=eq.${order_id}&delivery_date=eq.${delivery_date}&deleted_at=is.null&select=id`
    );

    let saved;
    if (existing && existing.length > 0) {
      saved = await fetchFromSupabase(`/belarro_v4_delivery?id=eq.${existing[0].id}`, {
        method: 'PATCH',
        body: JSON.stringify(row),
      });
    } else {
      const id = crypto.randomUUID();
      saved = await fetchFromSupabase('/belarro_v4_delivery', {
        method: 'POST',
        body: JSON.stringify({ id, ...row }),
      });
    }

    return NextResponse.json({ success: true, data: saved ? saved[0] : row });
  } catch (error) {
    console.error('Deliveries confirm POST error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
