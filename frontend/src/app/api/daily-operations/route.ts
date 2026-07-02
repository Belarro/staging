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
  task_type: 'soak' | 'seed' | 'stack' | 'blackout' | 'light' | 'humidity_dome' | 'harvest';
  notes?: string;
}

interface DailyOperation {
  date: string;
  display: string;
  day_of_week: string;
  tasks: DailyTask[];
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

    // Calculate what we need to seed in the next 4 weeks
    interface SeedingPlan {
      seed_date: Date;
      crop_id: string;
      crop_name: string;
      grams_needed: number;
      trays_needed: number;
      procedure: any;
    }

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

    // Build daily operations calendar by calculating backwards from seeding dates
    const dailyOpsMap = new Map<string, DailyTask[]>();

    for (const plan of seedingPlans) {
      const proc = plan.procedure;
      const seedDate = plan.seed_date;
      let currentDate = new Date(seedDate);

      // Work backwards from seed date
      // Soak comes first (before seed)
      if (proc?.soak_enabled && proc?.soak_hours) {
        const soakDate = new Date(seedDate);
        soakDate.setDate(soakDate.getDate() - Math.ceil(proc.soak_hours / 24));
        const soakKey = ymd(soakDate);
        if (!dailyOpsMap.has(soakKey)) dailyOpsMap.set(soakKey, []);
        dailyOpsMap.get(soakKey)!.push({
          crop_name: plan.crop_name,
          crop_id: plan.crop_id,
          grams_needed: plan.grams_needed,
          trays_needed: plan.trays_needed,
          task_type: 'soak',
          notes: `Soak for ${proc.soak_hours} hours${proc.soak_notes ? ' (' + proc.soak_notes + ')' : ''}`,
        });
      }

      // Seeding on seed date
      const seedKey = ymd(seedDate);
      if (!dailyOpsMap.has(seedKey)) dailyOpsMap.set(seedKey, []);
      dailyOpsMap.get(seedKey)!.push({
        crop_name: plan.crop_name,
        crop_id: plan.crop_id,
        grams_needed: plan.grams_needed,
        trays_needed: plan.trays_needed,
        task_type: 'seed',
        notes: proc?.soak_enabled ? 'Seed (after soaking)' : 'Seed',
      });

      // Stacking (after seeding)
      if (proc?.stack_enabled && proc?.stack_days) {
        const stackStart = new Date(seedDate);
        stackStart.setDate(stackStart.getDate() + 1);
        for (let i = 0; i < proc.stack_days; i++) {
          const stackDate = new Date(stackStart);
          stackDate.setDate(stackDate.getDate() + i);
          const stackKey = ymd(stackDate);
          if (!dailyOpsMap.has(stackKey)) dailyOpsMap.set(stackKey, []);
          dailyOpsMap.get(stackKey)!.push({
            crop_name: plan.crop_name,
            crop_id: plan.crop_id,
            grams_needed: plan.grams_needed,
            trays_needed: plan.trays_needed,
            task_type: 'stack',
            notes: `Stack (Day ${i + 1}/${proc.stack_days})`,
          });
        }
      }

      // Blackout period (after stacking)
      if (proc?.blackout_enabled && proc?.blackout_days) {
        let blackoutStart = new Date(seedDate);
        blackoutStart.setDate(blackoutStart.getDate() + 1 + (proc.stack_days || 0));
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
            notes: `Blackout (Day ${i + 1}/${proc.blackout_days})`,
          });
        }
      }

      // Light period (after blackout)
      if (proc?.light_enabled && proc?.light_days) {
        let lightStart = new Date(seedDate);
        lightStart.setDate(
          lightStart.getDate() +
            1 +
            (proc.stack_days || 0) +
            (proc.blackout_days || 0)
        );
        for (let i = 0; i < proc.light_days; i++) {
          const lightDate = new Date(lightStart);
          lightDate.setDate(lightDate.getDate() + i);
          const lightKey = ymd(lightDate);
          if (!dailyOpsMap.has(lightKey)) dailyOpsMap.set(lightKey, []);
          dailyOpsMap.get(lightKey)!.push({
            crop_name: plan.crop_name,
            crop_id: plan.crop_id,
            grams_needed: plan.grams_needed,
            trays_needed: plan.trays_needed,
            task_type: 'light',
            notes: `Under lights (Day ${i + 1}/${proc.light_days})`,
          });
        }
      }

      // Humidity dome (can overlap with other phases, but typically during early growth)
      if (proc?.humidity_dome_enabled && proc?.humidity_dome_days) {
        const domeStart = new Date(seedDate);
        domeStart.setDate(domeStart.getDate() + 1);
        for (let i = 0; i < proc.humidity_dome_days; i++) {
          const domeDate = new Date(domeStart);
          domeDate.setDate(domeDate.getDate() + i);
          const domeKey = ymd(domeDate);
          if (!dailyOpsMap.has(domeKey)) dailyOpsMap.set(domeKey, []);
          dailyOpsMap.get(domeKey)!.push({
            crop_name: plan.crop_name,
            crop_id: plan.crop_id,
            grams_needed: plan.grams_needed,
            trays_needed: plan.trays_needed,
            task_type: 'humidity_dome',
            notes: `Humidity dome (Day ${i + 1}/${proc.humidity_dome_days})`,
          });
        }
      }

      // Harvest (on Tuesday after growing period)
      const totalGrowDays =
        (proc?.stack_days || 0) +
        (proc?.blackout_days || 0) +
        (proc?.light_days || 0);
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
            // Sort by task type priority
            const priority: Record<string, number> = {
              'soak': 1,
              'seed': 2,
              'stack': 3,
              'humidity_dome': 4,
              'blackout': 5,
              'light': 6,
              'harvest': 7,
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
