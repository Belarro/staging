import { NextRequest, NextResponse } from 'next/server';
import { fetchFromSupabase } from '@/lib/supabase';

const TUESDAY = 2;
const FRIDAY = 5;

function nextDayOnOrAfter(from: Date, day: number): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  while (d.getDay() !== day) d.setDate(d.getDate() + 1);
  return d;
}

function nextTuesdayOnOrAfter(from: Date): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  while (d.getDay() !== TUESDAY) d.setDate(d.getDate() + 1);
  return d;
}

function ymd(d: Date): string {
  return d.toISOString().split('T')[0];
}

function fmt(d: Date): string {
  return d.toLocaleDateString('en-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

interface DailyTask {
  crop_name: string;
  crop_id: string;
  grams_needed: number;
  trays_needed: number;
  task_type: 'soak' | 'seed_stack' | 'blackout' | 'light' | 'harvest';
  notes?: string;
}

interface DailyOperation {
  date: string;
  display: string;
  day_of_week: string;
  tasks: DailyTask[];
}

interface SeedingPlan {
  seed_date: Date;
  crop_id: string;
  crop_name: string;
  grams_needed: number;
  trays_needed: number;
  procedure: any;
}

export async function GET(request: NextRequest) {
  try {
    const [orders, variants, crops, procedures, mixComponents] = await Promise.all([
      fetchFromSupabase('/belarro_v4_order?status=in.(active,pending_seed,growing)&deleted_at=is.null&select=*'),
      fetchFromSupabase('/belarro_v4_product_variant?select=*'),
      fetchFromSupabase('/belarro_v4_crop?select=*'),
      fetchFromSupabase('/belarro_v4_growth_procedure?select=*'),
      fetchFromSupabase('/belarro_v4_crop_mix_component?select=*'),
    ]);

    const varMap = new Map<string, any>((variants || []).map((v: any) => [v.id, v]));
    const cropMap = new Map<string, any>((crops || []).map((c: any) => [c.id, c]));
    const procMap = new Map<string, any>((procedures || []).map((p: any) => [p.crop_id, p]));
    const mixComponentsMap = new Map<string, any[]>();
    for (const mc of (mixComponents || [])) {
      if (!mixComponentsMap.has(mc.mix_crop_id)) mixComponentsMap.set(mc.mix_crop_id, []);
      mixComponentsMap.get(mc.mix_crop_id)!.push(mc);
    }

    const isoWeek = (d: Date): number => {
      const tmp = new Date(d);
      tmp.setHours(0, 0, 0, 0);
      tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
      const week1 = new Date(tmp.getFullYear(), 0, 4);
      return 1 + Math.round(((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisWeekNum = isoWeek(today);

    const seedingPlans: SeedingPlan[] = [];

    const nextTuesday = nextTuesdayOnOrAfter(today);
    const nextFriday = new Date(today);
    while (nextFriday.getDay() !== FRIDAY) nextFriday.setDate(nextFriday.getDate() + 1);

    // Upcoming seed dates (next 4 Tuesdays and Fridays)
    const upcomingSeedDates: Date[] = [];
    for (let w = 0; w < 4; w++) {
      const tue = new Date(nextTuesday);
      tue.setDate(tue.getDate() + w * 7);
      const fri = new Date(nextFriday);
      fri.setDate(fri.getDate() + w * 7);
      upcomingSeedDates.push(tue);
      upcomingSeedDates.push(fri);
    }
    upcomingSeedDates.sort((a, b) => a.getTime() - b.getTime());

    // For each upcoming seed date, calculate what needs to be seeded
    for (const seedDate of upcomingSeedDates) {
      const weekNum = isoWeek(seedDate);
      const dayOfWeek = seedDate.getDay();
      const isSeeding = dayOfWeek === TUESDAY || dayOfWeek === FRIDAY;

      if (!isSeeding) continue;

      const gramsForDay = new Map<string, number>();

      for (const order of (orders || [])) {
        if (order.frequency === 'biweekly' && weekNum % 2 !== 0) continue;

        const variant = varMap.get(order.product_variant_id);
        const crop = variant ? cropMap.get(variant.crop_id) : null;
        if (!crop) continue;

        const proc = procMap.get(crop.id);
        const growDays = proc
          ? (proc.stack_days || 0) + (proc.blackout_days || 0) + (proc.light_days || 0)
          : 0;
        if (growDays === 0) continue;

        // Only include crops that belong on this seed day
        const belongsHere = dayOfWeek === TUESDAY ? growDays > 10 : growDays <= 10;
        if (!belongsHere) continue;

        const orderQty = order.quantity || 1;
        const sizeGrams = variant?.size_grams || 0;
        const totalGrams = orderQty * sizeGrams;

        if (crop.is_mix) {
          for (const comp of (mixComponentsMap.get(crop.id) || [])) {
            gramsForDay.set(
              comp.component_crop_id,
              (gramsForDay.get(comp.component_crop_id) || 0) + totalGrams * (comp.percentage / 100)
            );
          }
        } else {
          gramsForDay.set(crop.id, (gramsForDay.get(crop.id) || 0) + totalGrams);
        }
      }

      for (const [cropId, grams] of gramsForDay) {
        const crop = cropMap.get(cropId);
        if (!crop) continue;

        const proc = procMap.get(cropId);
        const yieldPerTray = crop.yield_per_tray_grams || null;
        const trays = yieldPerTray && grams > 0 ? Math.ceil(grams / yieldPerTray) : 1;

        seedingPlans.push({
          seed_date: seedDate,
          crop_id: cropId,
          crop_name: crop.name_en,
          grams_needed: Math.round(grams),
          trays_needed: trays,
          procedure: proc,
        });
      }
    }

    // Build daily operations calendar
    const dailyOpsMap = new Map<string, DailyTask[]>();

    for (const plan of seedingPlans) {
      const proc = plan.procedure;
      if (!proc) continue;

      const seedDate = plan.seed_date;

      // 1. Soak (day before seeding, if needed)
      if (proc.soak_enabled && proc.soak_hours) {
        const soakDaysBefore = Math.ceil(proc.soak_hours / 24);
        const soakDate = new Date(seedDate);
        soakDate.setDate(soakDate.getDate() - soakDaysBefore);
        const soakKey = ymd(soakDate);
        if (!dailyOpsMap.has(soakKey)) dailyOpsMap.set(soakKey, []);
        dailyOpsMap.get(soakKey)!.push({
          crop_name: plan.crop_name,
          crop_id: plan.crop_id,
          grams_needed: plan.grams_needed,
          trays_needed: plan.trays_needed,
          task_type: 'soak',
          notes: `Soak for ${proc.soak_hours}h${proc.soak_notes ? ' (' + proc.soak_notes + ')' : ''}`,
        });
      }

      // 2. Seed + Stack (same day)
      const seedKey = ymd(seedDate);
      if (!dailyOpsMap.has(seedKey)) dailyOpsMap.set(seedKey, []);
      const stackNote = proc.stack_enabled ? `Seed & Stack (${proc.stack_days}d)` : 'Seed';
      dailyOpsMap.get(seedKey)!.push({
        crop_name: plan.crop_name,
        crop_id: plan.crop_id,
        grams_needed: plan.grams_needed,
        trays_needed: plan.trays_needed,
        task_type: 'seed_stack',
        notes: proc.cover_soil_enabled ? `${stackNote}${proc.cover_soil_notes ? ', ' + proc.cover_soil_notes : ''}` : stackNote,
      });

      // 3. Blackout period (starts after stack days)
      if (proc.blackout_enabled && proc.blackout_days) {
        const blackoutStart = new Date(seedDate);
        blackoutStart.setDate(blackoutStart.getDate() + (proc.stack_days || 0));
        for (let i = 0; i < proc.blackout_days; i++) {
          const blackoutDate = new Date(blackoutStart);
          blackoutDate.setDate(blackoutDate.getDate() + i);
          const blackoutKey = ymd(blackoutDate);
          if (!dailyOpsMap.has(blackoutKey)) dailyOpsMap.set(blackoutKey, []);
          dailyOpsMap.get(blackoutKey)!.push({
            crop_name: plan.crop_name,
            crop_id: plan.crop_id,
            grams_needed: plan.grams_needed,
            trays_needed: plan.trays_needed,
            task_type: 'blackout',
            notes: `Blackout (${i + 1}/${proc.blackout_days})${proc.blackout_notes ? ' - ' + proc.blackout_notes : ''}`,
          });
        }
      }

      // 4. Light period (starts after stack + blackout)
      if (proc.light_enabled && proc.light_days) {
        const lightStart = new Date(seedDate);
        lightStart.setDate(lightStart.getDate() + (proc.stack_days || 0) + (proc.blackout_days || 0));

        for (let i = 0; i < proc.light_days; i++) {
          const lightDate = new Date(lightStart);
          lightDate.setDate(lightDate.getDate() + i);
          const lightKey = ymd(lightDate);
          if (!dailyOpsMap.has(lightKey)) dailyOpsMap.set(lightKey, []);

          // Check if humidity dome applies on this light day
          const hasDome = proc.humidity_dome_enabled &&
            proc.humidity_dome_days &&
            i < proc.humidity_dome_days;

          const notes = hasDome
            ? `Light + Humidity dome (${i + 1}/${proc.light_days})${proc.humidity_dome_notes ? ' - ' + proc.humidity_dome_notes : ''}`
            : `Light (${i + 1}/${proc.light_days})${proc.light_notes ? ' - ' + proc.light_notes : ''}`;

          dailyOpsMap.get(lightKey)!.push({
            crop_name: plan.crop_name,
            crop_id: plan.crop_id,
            grams_needed: plan.grams_needed,
            trays_needed: plan.trays_needed,
            task_type: 'light',
            notes,
          });
        }
      }

      // 5. Harvest (on next Tuesday after all growing days)
      const totalGrowDays = (proc.stack_days || 0) + (proc.blackout_days || 0) + (proc.light_days || 0);
      const harvestRaw = new Date(seedDate);
      harvestRaw.setDate(harvestRaw.getDate() + totalGrowDays);
      const harvestTuesday = nextTuesdayOnOrAfter(harvestRaw);
      const harvestKey = ymd(harvestTuesday);
      if (!dailyOpsMap.has(harvestKey)) dailyOpsMap.set(harvestKey, []);
      dailyOpsMap.get(harvestKey)!.push({
        crop_name: plan.crop_name,
        crop_id: plan.crop_id,
        grams_needed: plan.grams_needed,
        trays_needed: plan.trays_needed,
        task_type: 'harvest',
        notes: 'Ready to harvest',
      });
    }

    // Build final daily operations list
    const dailyOperations: DailyOperation[] = Array.from(dailyOpsMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([dateStr, tasks]) => {
        const date = new Date(dateStr + 'T00:00:00Z');
        return {
          date: dateStr,
          display: fmt(date),
          day_of_week: date.toLocaleDateString('en-DE', { weekday: 'long' }),
          tasks: tasks.sort((a, b) => {
            const priority: Record<string, number> = {
              'soak': 1,
              'seed_stack': 2,
              'blackout': 3,
              'light': 4,
              'harvest': 5,
            };
            return (priority[a.task_type] || 99) - (priority[b.task_type] || 99);
          }),
        };
      });

    return NextResponse.json({
      success: true,
      data: {
        daily_operations: dailyOperations,
        today: ymd(today),
      },
    });
  } catch (error) {
    console.error('Daily-operations GET error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
