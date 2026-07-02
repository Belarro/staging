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
    const { searchParams } = new URL(request.url);
import { requireAuth } from '@/lib/auth';
    const month = searchParams.get('month'); // YYYY-MM
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    let path = '/belarro_v4_invoice?select=*&order=invoice_month.desc';
import { requireAuth } from '@/lib/auth';
    if (month) {
import { requireAuth } from '@/lib/auth';
      path = `/belarro_v4_invoice?invoice_month=eq.${month}&select=*`;
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    try {
import { requireAuth } from '@/lib/auth';
      const invoices = await fetchFromSupabase(path);
import { requireAuth } from '@/lib/auth';
      const invs = invoices || [];
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
      // Hydrate customer details
import { requireAuth } from '@/lib/auth';
      const customers = await fetchFromSupabase('/belarro_v4_customer?select=id,name');
import { requireAuth } from '@/lib/auth';
      const custMap = new Map<string, any>((customers || []).map((c: any) => [c.id, c]));
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
      const hydrated = invs.map((i: any) => ({
import { requireAuth } from '@/lib/auth';
        ...i,
import { requireAuth } from '@/lib/auth';
        customer: custMap.get(i.customer_id) || { name: 'Unknown Customer' }
import { requireAuth } from '@/lib/auth';
      }));
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
      console.warn('Invoices table not ready, using mocks');
import { requireAuth } from '@/lib/auth';
      return NextResponse.json({
import { requireAuth } from '@/lib/auth';
        success: true,
import { requireAuth } from '@/lib/auth';
        data: [
import { requireAuth } from '@/lib/auth';
          {
import { requireAuth } from '@/lib/auth';
            id: 'mock-i1',
import { requireAuth } from '@/lib/auth';
            customer_id: 'mock-c1',
import { requireAuth } from '@/lib/auth';
            invoice_month: '2026-06',
import { requireAuth } from '@/lib/auth';
            total_amount_eur: 325.00,
import { requireAuth } from '@/lib/auth';
            vat_amount_eur: 22.75,
import { requireAuth } from '@/lib/auth';
            status: 'draft',
import { requireAuth } from '@/lib/auth';
            customer: { name: 'Chefs Table' }
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
    console.error('Invoices GET error:', error);
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
    const { customer_id, invoice_month, total_amount_eur, vat_amount_eur, status } = body;
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    if (!customer_id || !invoice_month || total_amount_eur === undefined) {
import { requireAuth } from '@/lib/auth';
      return NextResponse.json({ success: false, error: 'customer_id, invoice_month, and total_amount_eur are required' }, { status: 400 });
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const invoiceId = crypto.randomUUID();
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const newInvoice = await fetchFromSupabase('/belarro_v4_invoice', {
import { requireAuth } from '@/lib/auth';
      method: 'POST',
import { requireAuth } from '@/lib/auth';
      body: JSON.stringify({
import { requireAuth } from '@/lib/auth';
        id: invoiceId,
import { requireAuth } from '@/lib/auth';
        customer_id,
import { requireAuth } from '@/lib/auth';
        invoice_month,
import { requireAuth } from '@/lib/auth';
        total_amount_eur: parseFloat(total_amount_eur),
import { requireAuth } from '@/lib/auth';
        vat_amount_eur: vat_amount_eur ? parseFloat(vat_amount_eur) : parseFloat((total_amount_eur * 0.07).toFixed(2)), // Default 7% VAT for farm goods in DE
import { requireAuth } from '@/lib/auth';
        status: status || 'draft'
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
      data: newInvoice ? newInvoice[0] : { id: invoiceId, customer_id, invoice_month },
import { requireAuth } from '@/lib/auth';
      message: 'Invoice logged successfully'
import { requireAuth } from '@/lib/auth';
    });
import { requireAuth } from '@/lib/auth';
  } catch (error) {
import { requireAuth } from '@/lib/auth';
    console.error('Invoice POST error:', error);
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
    const { id, status } = body;
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    if (!id || !status) {
import { requireAuth } from '@/lib/auth';
      return NextResponse.json({ success: false, error: 'id and status are required' }, { status: 400 });
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const updated = await fetchFromSupabase(`/belarro_v4_invoice?id=eq.${id}`, {
import { requireAuth } from '@/lib/auth';
      method: 'PATCH',
import { requireAuth } from '@/lib/auth';
      body: JSON.stringify({
import { requireAuth } from '@/lib/auth';
        status,
import { requireAuth } from '@/lib/auth';
        updated_at: new Date().toISOString(),
import { requireAuth } from '@/lib/auth';
        sent_at: status === 'sent' ? new Date().toISOString() : undefined,
import { requireAuth } from '@/lib/auth';
        paid_at: status === 'paid' ? new Date().toISOString() : undefined,
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
      message: 'Invoice status updated'
import { requireAuth } from '@/lib/auth';
    });
import { requireAuth } from '@/lib/auth';
  } catch (error) {
import { requireAuth } from '@/lib/auth';
    console.error('Invoice PUT error:', error);
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
