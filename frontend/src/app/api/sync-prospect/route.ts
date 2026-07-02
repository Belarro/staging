import { NextRequest, NextResponse } from 'next/server';
import { fetchFromSupabase } from '@/lib/supabase';

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
}

// 1. DEDUPLICATION: Check if customer already exists by phone or email
async function findExistingCustomer(payload: ProspectPayload) {
  const normalizedPhone = normalizePhone(payload.directPhone);
  const directEmail = (payload.directEmail || '').toLowerCase();
  const businessEmail = (payload.businessEmail || '').toLowerCase();

  // Try phone match first
  if (payload.directPhone) {
    try {
      const customers = await fetchFromSupabase(
        `/belarro_v4_customer?phone=eq.${encodeURIComponent(payload.directPhone)}&select=id,updated_at,st_location_id`
      );
      if (customers && customers.length > 0) {
        return customers[0];
      }
    } catch (err) {
      console.warn('Phone lookup error:', err);
    }
  }

  // Try email match
  if (directEmail) {
    try {
      const customers = await fetchFromSupabase(
        `/belarro_v4_customer?email=eq.${encodeURIComponent(directEmail)}&select=id,updated_at,st_location_id`
      );
      if (customers && customers.length > 0) {
        return customers[0];
      }
    } catch (err) {
      console.warn('Email lookup error:', err);
    }
  }

  // Try business email match
  if (businessEmail) {
    try {
      const customers = await fetchFromSupabase(
        `/belarro_v4_customer?business_email=eq.${encodeURIComponent(businessEmail)}&select=id,updated_at,st_location_id`
      );
      if (customers && customers.length > 0) {
        return customers[0];
      }
    } catch (err) {
      console.warn('Business email lookup error:', err);
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
    st_location_id: payload.directLink || null,
    source: 'saletracker',
    last_synced_at: now,
    status: 'prospect',
    updated_at: now,
  };

  if (existing) {
    // UPDATE: only update mutable fields
    const updatePayload = await fetchFromSupabase(
      `/belarro_v4_customer?id=eq.${customerId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
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
        }),
      }
    );

    return { id: customerId, isNew: false };
  } else {
    // INSERT
    const created = await fetchFromSupabase('/belarro_v4_customer', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });

    return { id: customerId, isNew: true };
  }
}

// 3. AUTO-CREATE FOLLOW-UPS for new customers only
async function seedFollowUps(customerId: string, visitDate: string) {
  // Check if follow-ups already exist
  try {
    const existing = await fetchFromSupabase(
      `/belarro_v4_follow_up?customer_id=eq.${customerId}&select=id`
    );
    if (existing && existing.length > 0) {
      return; // Already created
    }
  } catch (err) {
    console.warn('Follow-up check error:', err);
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

  try {
    await fetchFromSupabase('/belarro_v4_follow_up', {
      method: 'POST',
      body: JSON.stringify(rows),
    });
  } catch (err) {
    console.warn('Follow-up seed warning (non-fatal):', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: ProspectPayload = await request.json();

    // Validate required fields
    if (!payload.locationName || !payload.contactPerson || !payload.directPhone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: locationName, contactPerson, directPhone',
        },
        { status: 400 }
      );
    }

    // Sync customer (insert or update)
    const { id: customerId, isNew } = await syncCustomer(payload);

    // Only seed follow-ups if this is a NEW customer
    if (isNew) {
      await seedFollowUps(customerId, payload.visitDate || new Date().toISOString());
    }

    return NextResponse.json({
      success: true,
      id: customerId,
      isNew,
      locationName: payload.locationName,
      contactPerson: payload.contactPerson,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
