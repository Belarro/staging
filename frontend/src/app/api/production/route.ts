import { NextRequest, NextResponse } from 'next/server';
import { fetchFromSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

// Tuesday = 2, Friday = 5 (JS: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat)
const TUESDAY = 2;
const FRIDAY = 5;

// Find the latest Tuesday or Friday that is ON OR BEFORE the given date.
// This ensures we don't seed too late — we must seed on or before the required date.
function snapToSeedDay(date: Date, useTuesday: boolean): Date {
  const target = useTuesday ? TUESDAY : FRIDAY;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Walk backward until we land on the right day
  while (d.getDay() !== target) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

// Next occurrence of a day (0-6) on or after a given date
function nextDayOnOrAfter(from: Date, day: number): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  while (d.getDay() !== day) d.setDate(d.getDate() + 1);
  return d;
}

// Next Tuesday on or after a given date
function nextTuesdayOnOrAfter(from: Date): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  while (d.getDay() !== TUESDAY) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

// Format date as YYYY-MM-DD
function ymd(d: Date): string {
  return d.toISOString().split('T')[0];
}

// Format for display
function fmt(d: Date): string {
  return d.toLocaleDateString('en-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const [orders, variants, crops, procedures, customers, batches, harvests] = await Promise.all([
      fetchFromSupabase('/belarro_v4_order?status=in.(active,pending_seed,growing)&deleted_at=is.null&select=*'),
      fetchFromSupabase('/belarro_v4_product_variant?select=*'),
      fetchFromSupabase('/belarro_v4_crop?select=*'),
      fetchFromSupabase('/belarro_v4_growth_procedure?select=crop_id,stack_days,blackout_days,light_days'),
      fetchFromSupabase('/belarro_v4_customer?select=id,name&deleted_at=is.null'),
      fetchFromSupabase('/belarro_v4_seeding_batch?select=*'),
      fetchFromSupabase('/belarro_v4_harvest_record?select=*'),
    ]);

    const varMap = new Map<string, any>((variants || []).map((v: any) => [v.id, v]));
    const cropMap = new Map<string, any>((crops || []).map((c: any) => [c.id, c]));
    const procMap = new Map<string, any>((procedures || []).map((p: any) => [p.crop_id, p]));
    const custMap = new Map<string, any>((customers || []).map((c: any) => [c.id, c]));

    // Active batches (in the ground, not yet harvested)
    const harvestedIds = new Set((harvests || []).map((h: any) => h.seeding_batch_id));
    const activeBatches = (batches || [])
      .filter((b: any) => !harvestedIds.has(b.id))
      .map((b: any) => ({
        ...b,
        crop: cropMap.get(b.crop_id) || { name_en: 'Unknown', name_de: '' },
      }));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const readyToHarvest = activeBatches.filter((b: any) => new Date(b.expected_harvest_date) <= today);

    // ── PRODUCTION CALENDAR ────────────────────────────────────────────
    // One delivery group per customer. Within each group, crops are deduplicated
    // (multiple order lines for the same crop → sum trays).

    // ISO week number helper — used to determine biweekly seeding week
    const isoWeek = (d: Date): number => {
      const tmp = new Date(d);
      tmp.setHours(0, 0, 0, 0);
      tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
      const week1 = new Date(tmp.getFullYear(), 0, 4);
      return 1 + Math.round(((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    };
    const thisWeekNum = isoWeek(today);

    // What to seed this Tuesday and this Friday
    const nextTuesday = nextTuesdayOnOrAfter(today);
    const nextFriday = new Date(today);
    while (nextFriday.getDay() !== FRIDAY) nextFriday.setDate(nextFriday.getDate() + 1);

    const todayKey = ymd(today);
    const tuesdayKey = ymd(nextTuesday);
    const fridayKey = ymd(nextFriday);

    // ── SEEDING SCHEDULE: per crop line, not per customer ──────────────
    // Each order line independently determines its seed day based on its own grow days.
    // Tuesday = 11+ days grow. Friday = 1-10 days grow.
    // Biweekly orders only appear on even ISO weeks.

    // seed day buckets: Map<seedDateKey, Map<cropId, {crop_name, trays, customers}>>
    const bySeedDateMap = new Map<string, Map<string, { crop_name: string; trays: number; customers: string[] }>>();

    // delivery schedule: per customer, one entry, harvest date = next Tuesday after longest grow crop
    const customerDeliveryMap = new Map<string, { harvest_date: string; harvest_display: string; customer_name: string; items: any[] }>();

    for (const order of (orders || [])) {
      // Biweekly: only include on even ISO weeks
      if (order.frequency === 'biweekly' && thisWeekNum % 2 !== 0) continue;

      const customer = custMap.get(order.customer_id);
      if (!customer?.name) continue;

      const variant = varMap.get(order.product_variant_id);
      const crop = variant ? cropMap.get(variant.crop_id) : null;
      if (!crop) continue;

      const proc = procMap.get(crop.id);
      const growDays = proc
        ? (proc.stack_days || 0) + (proc.blackout_days || 0) + (proc.light_days || 0)
        : 0;

      const orderQty = order.quantity || 1;
      const sizeGrams = variant?.size_grams || 0;
      const yieldPerTray = crop.yield_per_tray_grams || null;
      const traysNeeded = yieldPerTray && sizeGrams > 0
        ? Math.ceil((orderQty * sizeGrams) / yieldPerTray)
        : orderQty;

      if (growDays === 0) continue; // no procedure configured — skip

      // Each crop seeds independently based on its own grow days
      const useTuesday = growDays > 10;
      const seedDayTarget = useTuesday ? TUESDAY : FRIDAY;
      const seedDate = nextDayOnOrAfter(today, seedDayTarget);
      const seedKey = ymd(seedDate);

      // Add to seed day bucket
      if (!bySeedDateMap.has(seedKey)) bySeedDateMap.set(seedKey, new Map());
      const dayMap = bySeedDateMap.get(seedKey)!;
      if (!dayMap.has(crop.id)) {
        dayMap.set(crop.id, { crop_name: crop.name_en, trays: 0, customers: [] });
      }
      const entry = dayMap.get(crop.id)!;
      entry.trays += traysNeeded;
      if (!entry.customers.includes(customer.name)) entry.customers.push(customer.name);

      // Harvest date for delivery tab: next Tuesday after grow days from seed date
      const harvestRaw = new Date(seedDate);
      harvestRaw.setDate(harvestRaw.getDate() + growDays);
      const harvestTuesday = nextTuesdayOnOrAfter(harvestRaw);
      const harvestKey = ymd(harvestTuesday);

      if (!customerDeliveryMap.has(order.customer_id)) {
        customerDeliveryMap.set(order.customer_id, {
          harvest_date: harvestKey,
          harvest_display: fmt(harvestTuesday),
          customer_name: customer.name,
          items: [],
        });
      }
      const delivery = customerDeliveryMap.get(order.customer_id)!;
      // Use the latest harvest date across all crops for this customer
      if (harvestKey > delivery.harvest_date) {
        delivery.harvest_date = harvestKey;
        delivery.harvest_display = fmt(harvestTuesday);
      }
      delivery.items.push({
        crop_name: crop.name_en,
        order_qty: orderQty,
        size_name: variant?.size_name || '',
        size_grams: sizeGrams,
        trays_needed: traysNeeded,
      });
    }

    const schedule = Array.from(customerDeliveryMap.values()).sort((a, b) =>
      a.harvest_date.localeCompare(b.harvest_date) || a.customer_name.localeCompare(b.customer_name)
    );

    const flatSeedDay = (dateKey: string) =>
      Array.from((bySeedDateMap.get(dateKey) || new Map()).values()).map(e => ({
        crop_name: e.crop_name,
        quantity_trays: e.trays,
        customer_name: e.customers.join(', '),
      }));

    return NextResponse.json({
      success: true,
      data: {
        schedule,
        seed_today: flatSeedDay(todayKey),
        seed_tuesday: flatSeedDay(tuesdayKey),
        seed_friday: flatSeedDay(fridayKey),
        active_batches: activeBatches,
        ready_to_harvest: readyToHarvest,
        today: todayKey,
        next_tuesday: tuesdayKey,
        next_friday: fridayKey,
      },
    });
  } catch (error) {
    console.error('Production GET error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
