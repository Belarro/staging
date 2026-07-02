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
    // Fetch Belarro customers + SalesTracker locations in parallel
import { requireAuth } from '@/lib/auth';
    const [customers, locations] = await Promise.all([
import { requireAuth } from '@/lib/auth';
      fetchFromSupabase('/belarro_v4_customer?deleted_at=is.null&select=*&order=created_at.desc').catch(() => []),
import { requireAuth } from '@/lib/auth';
      fetchFromSupabase('/locations?archived=neq.YES&select=id,location_name,contact_person,direct_phone,business_phone,direct_email,business_email,pipeline_stage,interest_level,visit_notes,sales_rep,timestamp,created_at&order=timestamp.desc.nullslast&limit=500').catch(() => []),
import { requireAuth } from '@/lib/auth';
    ]);
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    // Normalize belarro_v4_customer rows
import { requireAuth } from '@/lib/auth';
    const customerRows = (customers || []).map((c: any) => ({
import { requireAuth } from '@/lib/auth';
      id: c.id,
import { requireAuth } from '@/lib/auth';
      _source: 'belarro',
import { requireAuth } from '@/lib/auth';
      name: c.restaurant_name || c.name,
import { requireAuth } from '@/lib/auth';
      contact_person: c.contact_person || null,
import { requireAuth } from '@/lib/auth';
      contact_title: c.contact_title || null,
import { requireAuth } from '@/lib/auth';
      email: c.email || null,
import { requireAuth } from '@/lib/auth';
      phone: c.phone || null,
import { requireAuth } from '@/lib/auth';
      whatsapp: c.whatsapp || null,
import { requireAuth } from '@/lib/auth';
      address: c.address || null,
import { requireAuth } from '@/lib/auth';
      city: c.city || null,
import { requireAuth } from '@/lib/auth';
      status: c.status, // 'active' | 'prospect' | 'paused' | 'inactive'
import { requireAuth } from '@/lib/auth';
      net_days: c.net_days || 30,
import { requireAuth } from '@/lib/auth';
      tax_number: c.tax_number || null,
import { requireAuth } from '@/lib/auth';
      interest_level: null,
import { requireAuth } from '@/lib/auth';
      visit_notes: null,
import { requireAuth } from '@/lib/auth';
      visited_at: null,
import { requireAuth } from '@/lib/auth';
      first_contact_date: c.first_contact_date,
import { requireAuth } from '@/lib/auth';
      created_at: c.created_at,
import { requireAuth } from '@/lib/auth';
    }));
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    // Belarro customer IDs already in the system (to avoid duplication)
import { requireAuth } from '@/lib/auth';
    const belarroCustIds = new Set(customerRows.map((c: any) => c.id));
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    // Normalize locations rows — map pipeline_stage to status
import { requireAuth } from '@/lib/auth';
    const stageToStatus = (stage: string | null): string => {
import { requireAuth } from '@/lib/auth';
      if (!stage) return 'prospect';
import { requireAuth } from '@/lib/auth';
      if (stage === 'active') return 'active';
import { requireAuth } from '@/lib/auth';
      if (stage === 'snoozed') return 'paused';
import { requireAuth } from '@/lib/auth';
      return 'prospect'; // new_visit, follow_up_1..5, etc.
import { requireAuth } from '@/lib/auth';
    };
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const locationRows = (locations || [])
import { requireAuth } from '@/lib/auth';
      .filter((loc: any) => !belarroCustIds.has(loc.id)) // skip if already in belarro
import { requireAuth } from '@/lib/auth';
      .map((loc: any) => ({
import { requireAuth } from '@/lib/auth';
        id: loc.id,
import { requireAuth } from '@/lib/auth';
        _source: 'saletracker',
import { requireAuth } from '@/lib/auth';
        name: loc.location_name,
import { requireAuth } from '@/lib/auth';
        contact_person: loc.contact_person || null,
import { requireAuth } from '@/lib/auth';
        contact_title: null,
import { requireAuth } from '@/lib/auth';
        email: loc.direct_email || loc.business_email || null,
import { requireAuth } from '@/lib/auth';
        phone: loc.direct_phone || loc.business_phone || null,
import { requireAuth } from '@/lib/auth';
        whatsapp: null,
import { requireAuth } from '@/lib/auth';
        address: null,
import { requireAuth } from '@/lib/auth';
        city: null,
import { requireAuth } from '@/lib/auth';
        status: stageToStatus(loc.pipeline_stage),
import { requireAuth } from '@/lib/auth';
        net_days: 30,
import { requireAuth } from '@/lib/auth';
        tax_number: null,
import { requireAuth } from '@/lib/auth';
        interest_level: loc.interest_level || null,
import { requireAuth } from '@/lib/auth';
        visit_notes: loc.visit_notes || null,
import { requireAuth } from '@/lib/auth';
        sales_rep: loc.sales_rep || null,
import { requireAuth } from '@/lib/auth';
        visited_at: loc.timestamp || null,
import { requireAuth } from '@/lib/auth';
        first_contact_date: loc.timestamp || loc.created_at,
import { requireAuth } from '@/lib/auth';
        created_at: loc.created_at,
import { requireAuth } from '@/lib/auth';
      }));
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const all = [...customerRows, ...locationRows];
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    return NextResponse.json({ success: true, data: all });
import { requireAuth } from '@/lib/auth';
  } catch (error) {
import { requireAuth } from '@/lib/auth';
    console.error('Customers GET error:', error);
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
    const {
import { requireAuth } from '@/lib/auth';
      name,
import { requireAuth } from '@/lib/auth';
      restaurant_name,
import { requireAuth } from '@/lib/auth';
      contact_person,
import { requireAuth } from '@/lib/auth';
      contact_title,
import { requireAuth } from '@/lib/auth';
      tax_number,
import { requireAuth } from '@/lib/auth';
      address,
import { requireAuth } from '@/lib/auth';
      city,
import { requireAuth } from '@/lib/auth';
      email,
import { requireAuth } from '@/lib/auth';
      whatsapp,
import { requireAuth } from '@/lib/auth';
      phone,
import { requireAuth } from '@/lib/auth';
      net_days,
import { requireAuth } from '@/lib/auth';
      status,
import { requireAuth } from '@/lib/auth';
    } = body;
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    if (!name) {
import { requireAuth } from '@/lib/auth';
      return NextResponse.json(
import { requireAuth } from '@/lib/auth';
        { success: false, error: 'Name is required' },
import { requireAuth } from '@/lib/auth';
        { status: 400 }
import { requireAuth } from '@/lib/auth';
      );
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const customerId = crypto.randomUUID();
import { requireAuth } from '@/lib/auth';
    const firstContactDate = new Date().toISOString();
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    // Create customer record
import { requireAuth } from '@/lib/auth';
    const newCustomer = await fetchFromSupabase('/belarro_v4_customer', {
import { requireAuth } from '@/lib/auth';
      method: 'POST',
import { requireAuth } from '@/lib/auth';
      body: JSON.stringify({
import { requireAuth } from '@/lib/auth';
        id: customerId,
import { requireAuth } from '@/lib/auth';
        name,
import { requireAuth } from '@/lib/auth';
        restaurant_name: restaurant_name || null,
import { requireAuth } from '@/lib/auth';
        contact_person: contact_person || null,
import { requireAuth } from '@/lib/auth';
        contact_title: contact_title || 'owner',
import { requireAuth } from '@/lib/auth';
        tax_number: tax_number || null,
import { requireAuth } from '@/lib/auth';
        address: address || null,
import { requireAuth } from '@/lib/auth';
        city: city || null,
import { requireAuth } from '@/lib/auth';
        email: email || null,
import { requireAuth } from '@/lib/auth';
        whatsapp: whatsapp || null,
import { requireAuth } from '@/lib/auth';
        phone: phone || null,
import { requireAuth } from '@/lib/auth';
        status: status || 'prospect',
import { requireAuth } from '@/lib/auth';
        net_days: net_days ? parseInt(net_days) : 30,
import { requireAuth } from '@/lib/auth';
        first_contact_date: firstContactDate,
import { requireAuth } from '@/lib/auth';
      }),
import { requireAuth } from '@/lib/auth';
    });
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    // Auto-generate 5 follow-ups
import { requireAuth } from '@/lib/auth';
    const followUpDays = [0, 3, 7, 14, 30];
import { requireAuth } from '@/lib/auth';
    const followUps = [];
import { requireAuth } from '@/lib/auth';
    
import { requireAuth } from '@/lib/auth';
    for (let i = 0; i < followUpDays.length; i++) {
import { requireAuth } from '@/lib/auth';
      const days = followUpDays[i];
import { requireAuth } from '@/lib/auth';
      const dueDate = new Date();
import { requireAuth } from '@/lib/auth';
      dueDate.setDate(dueDate.getDate() + days);
import { requireAuth } from '@/lib/auth';
      
import { requireAuth } from '@/lib/auth';
      const followUpId = crypto.randomUUID();
import { requireAuth } from '@/lib/auth';
      const newFollowup = await fetchFromSupabase('/belarro_v4_follow_up', {
import { requireAuth } from '@/lib/auth';
        method: 'POST',
import { requireAuth } from '@/lib/auth';
        body: JSON.stringify({
import { requireAuth } from '@/lib/auth';
          id: followUpId,
import { requireAuth } from '@/lib/auth';
          customer_id: customerId,
import { requireAuth } from '@/lib/auth';
          follow_up_number: i + 1,
import { requireAuth } from '@/lib/auth';
          follow_up_days: days,
import { requireAuth } from '@/lib/auth';
          due_date: dueDate.toISOString(),
import { requireAuth } from '@/lib/auth';
          status: 'pending',
import { requireAuth } from '@/lib/auth';
          sent_via: null,
import { requireAuth } from '@/lib/auth';
          sent_date: null,
import { requireAuth } from '@/lib/auth';
          notes: null,
import { requireAuth } from '@/lib/auth';
        }),
import { requireAuth } from '@/lib/auth';
      });
import { requireAuth } from '@/lib/auth';
      followUps.push(newFollowup);
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    return NextResponse.json({
import { requireAuth } from '@/lib/auth';
      success: true,
import { requireAuth } from '@/lib/auth';
      data: {
import { requireAuth } from '@/lib/auth';
        ...(newCustomer ? newCustomer[0] : { id: customerId, name }),
import { requireAuth } from '@/lib/auth';
        follow_ups: followUps,
import { requireAuth } from '@/lib/auth';
      },
import { requireAuth } from '@/lib/auth';
      message: 'Customer created successfully with 5 auto-generated follow-ups',
import { requireAuth } from '@/lib/auth';
    });
import { requireAuth } from '@/lib/auth';
  } catch (error) {
import { requireAuth } from '@/lib/auth';
    console.error('Customer POST error:', error);
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
