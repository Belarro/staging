// supabase/functions/sync-prospect-to-restaurant/index.ts
// Called by SalesTracker when a prospect is added or updated on the street.
// Deno runtime. Deployed with: supabase functions deploy sync-prospect-to-restaurant

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

// Normalize phone: remove all non-digits and +
const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/[^\d+]/g, '');
};

// Helper: add business days to a date
const addBusinessDays = (from: Date, days: number): Date => {
  if (days === 0) return from;
  const result = new Date(from);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
};

interface ProspectPayload {
  locationName: string;
  contactPerson: string;
  directPhone: string;
  directEmail?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  businessTypes?: string;
  language?: string;
  visitNotes?: string;
  sampleGiven?: boolean;
  visitDate?: string;
  salesRep?: string;
  directLink?: string;
  interestLevel?: string;
  pipelineStage?: string;
  materials_sent?: boolean;
  notes_internal?: string;
  uses_microgreens?: boolean;
  // For future: automationStatus, followUpCount, etc.
}

// 1. DEDUPLICATION: Check if customer already exists by phone or email
async function findExistingCustomer(payload: ProspectPayload) {
  const normalizedPhone = normalizePhone(payload.directPhone);
  const normalizedBusinessPhone = normalizePhone(payload.businessPhone || '');
  const directEmail = (payload.directEmail || '').toLowerCase();
  const businessEmail = (payload.businessEmail || '').toLowerCase();

  // Build OR conditions
  let query = supabase
    .from('belarro_v4_customer')
    .select('id, updated_at, st_location_id');

  // First, try exact matches on normalized phone
  if (normalizedPhone) {
    const { data: byPhone } = await supabase
      .from('belarro_v4_customer')
      .select('id, updated_at, st_location_id')
      .or(
        `phone.eq.${payload.directPhone},phone.eq.+${normalizedPhone}`
      )
      .limit(1);

    if (byPhone && byPhone.length > 0) {
      return byPhone[0];
    }
  }

  // Then try email matches
  if (directEmail) {
    const { data: byEmail } = await supabase
      .from('belarro_v4_customer')
      .select('id, updated_at, st_location_id')
      .eq('email', directEmail)
      .limit(1);

    if (byEmail && byEmail.length > 0) {
      return byEmail[0];
    }
  }

  // Then try business email
  if (businessEmail) {
    const { data: byBizEmail } = await supabase
      .from('belarro_v4_customer')
      .select('id, updated_at, st_location_id')
      .eq('business_email', businessEmail)
      .limit(1);

    if (byBizEmail && byBizEmail.length > 0) {
      return byBizEmail[0];
    }
  }

  return null;
}

// 2. CREATE OR UPDATE customer record
async function syncCustomer(payload: ProspectPayload) {
  const existing = await findExistingCustomer(payload);
  const customerId = existing?.id || crypto.randomUUID();
  const now = new Date().toISOString();

  const customerData = {
    id: customerId,
    name: payload.locationName,
    restaurant_name: payload.locationName,
    contact_person: payload.contactPerson,
    phone: payload.directPhone,
    email: payload.directEmail || null,
    business_phone: payload.businessPhone || null,
    business_email: payload.businessEmail || null,
    business_website: payload.businessWebsite || null,
    business_types: payload.businessTypes || null,
    visit_notes: payload.visitNotes || null,
    interest_level: payload.interestLevel || 'prospect',
    sales_rep: payload.salesRep || null,
    language: (payload.language || 'DE').toUpperCase(),
    notes_internal: payload.notes_internal || null,
    uses_microgreens: payload.uses_microgreens || false,
    st_location_id: payload.directLink || null, // Use directLink as source ID if available
    source: 'saletracker',
    last_synced_at: now,
    status: 'prospect',
    created_at: existing ? existing.updated_at : now, // Preserve original created_at
    updated_at: now,
  };

  if (existing) {
    // UPDATE: only update mutable fields, preserve created_at
    const { data: updated, error: updateErr } = await supabase
      .from('belarro_v4_customer')
      .update({
        contact_person: payload.contactPerson,
        phone: payload.directPhone,
        email: payload.directEmail || null,
        business_phone: payload.businessPhone || null,
        business_email: payload.businessEmail || null,
        business_website: payload.businessWebsite || null,
        business_types: payload.businessTypes || null,
        visit_notes: payload.visitNotes || null,
        interest_level: payload.interestLevel || 'prospect',
        sales_rep: payload.salesRep || null,
        language: (payload.language || 'DE').toUpperCase(),
        notes_internal: payload.notes_internal || null,
        uses_microgreens: payload.uses_microgreens || false,
        last_synced_at: now,
        updated_at: now,
      })
      .eq('id', customerId)
      .select();

    if (updateErr) {
      throw new Error(`Update failed: ${updateErr.message}`);
    }

    return { id: customerId, isNew: false };
  } else {
    // INSERT
    const { data: created, error: insertErr } = await supabase
      .from('belarro_v4_customer')
      .insert([customerData])
      .select();

    if (insertErr) {
      throw new Error(`Insert failed: ${insertErr.message}`);
    }

    return { id: customerId, isNew: true };
  }
}

// 3. AUTO-CREATE FOLLOW-UPS for new customers only
async function seedFollowUps(customerId: string, visitDate: string) {
  // Check if follow-ups already exist for this customer
  const { data: existing } = await supabase
    .from('belarro_v4_follow_up')
    .select('id')
    .eq('customer_id', customerId)
    .limit(1);

  if (existing && existing.length > 0) {
    // Follow-ups already exist, skip (idempotency)
    return;
  }

  const NEW_LEAD_GAPS = { 1: 0, 2: 2, 3: 5, 4: 14, 5: 30 };
  const baseDate = new Date(visitDate || new Date().toISOString());
  const todayStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0, 0);

  const rows = [];
  for (const [stageStr, days] of Object.entries(NEW_LEAD_GAPS)) {
    const stage = Number(stageStr);
    const dueDate = stage === 1 ? todayStart : addBusinessDays(todayStart, days);

    rows.push({
      id: crypto.randomUUID(),
      customer_id: customerId,
      follow_up_number: stage,
      follow_up_days: days,
      due_date: dueDate.toISOString(),
      status: 'pending',
      sent_via: null,
      sent_date: null,
      notes: null,
      stage: stage,
    });
  }

  const { error: insertErr } = await supabase
    .from('belarro_v4_follow_up')
    .insert(rows);

  if (insertErr) {
    console.warn('Follow-up seed warning (non-fatal):', insertErr.message);
    // Don't throw — customer was created, follow-ups can be created manually
  }
}

// Main handler
Deno.serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
      },
    });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // Simple API key check (optional, for basic security)
  const apiKey = req.headers.get('x-api-key');
  const expectedKey = Deno.env.get('SYNC_API_KEY') || 'dev-key-change-in-production';
  if (apiKey !== expectedKey && expectedKey !== 'dev-key-change-in-production') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const payload: ProspectPayload = await req.json();

    // Validate required fields
    if (!payload.locationName || !payload.contactPerson || !payload.directPhone) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: locationName, contactPerson, directPhone',
        }),
        { status: 400 }
      );
    }

    // Sync customer (insert or update)
    const { id: customerId, isNew } = await syncCustomer(payload);

    // Only seed follow-ups if this is a NEW customer
    if (isNew) {
      await seedFollowUps(customerId, payload.visitDate || new Date().toISOString());
    }

    return new Response(
      JSON.stringify({
        success: true,
        id: customerId,
        isNew,
        locationName: payload.locationName,
        contactPerson: payload.contactPerson,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
