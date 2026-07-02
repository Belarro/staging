import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { fetchFromSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
// import removed
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
const CHEF_PAGE = 'https://belarro.com/for-chefs';
import { requireAuth } from '@/lib/auth';
const OLD_LEAD_DAYS = 30;
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
// ─── NEW LEAD FLOW (visited < 30 days ago) ───────────────────────────────────
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
const NEW_EN: Record<number, { title: string; template: string }> = {
import { requireAuth } from '@/lib/auth';
  1: {
import { requireAuth } from '@/lib/auth';
    title: 'The Link (2 hours)',
import { requireAuth } from '@/lib/auth';
    template: `Hello [Name],\n\nThank you for your time today; it was a pleasure meeting you.\n\nHere is the link for our varieties and pricing:\n\n${CHEF_PAGE}\n\nI would love to hear what you think. Just a reminder: no delivery fees, no minimum order.\n\nEnjoy the rest of your service.\nRon from Belarro`,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
  2: {
import { requireAuth } from '@/lib/auth';
    title: 'The Taste (2 days)',
import { requireAuth } from '@/lib/auth';
    template: `Hello [Name],\n\nRon from Belarro. I hope you had the chance to taste the samples and see how they work with your dishes.\n\nWe only grow what you order, no old stock, zero waste. We harvest the morning of delivery, and our greens last up to 10 days in the fridge.\n\nLet me know what caught your eye and I will get it into the next grow cycle.\n\nRon from Belarro`,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
  3: {
import { requireAuth } from '@/lib/auth';
    title: 'The Facts (5 days)',
import { requireAuth } from '@/lib/auth';
    template: `Hello [Name],\n\nRon from Belarro. Wanted to follow up and see how you found our greens.\n\nWe grow over 25 varieties, more variety than most suppliers, more options for your plates. Orders are recurring: order once, receive fresh every Tuesday. You can always change, add or cancel.\n\nHere is the full list:\n\n${CHEF_PAGE}\n\nRon from Belarro`,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
  4: {
import { requireAuth } from '@/lib/auth';
    title: 'The Easy Yes (2 weeks)',
import { requireAuth } from '@/lib/auth';
    template: `Hello [Name],\n\nRon from Belarro. Haven't heard back, just wanted to check in.\n\nWe are local. No imports, faster, more consistent product, just fresh greens with less emissions.\n\nNo minimums, no delivery fees. Just let me know when you are ready.\n\nRon from Belarro`,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
  5: {
import { requireAuth } from '@/lib/auth';
    title: 'The Open Door (1 month)',
import { requireAuth } from '@/lib/auth';
    template: `Hello [Name],\n\nRon from Belarro. No worries if the timing wasn't right.\n\nWhenever you need fresh microgreens, we are one message away. No minimums, free delivery, harvested the morning we bring them to you.\n\nOur varieties and pricing are always here:\n\n${CHEF_PAGE}\n\nWishing you a great season.\nRon from Belarro`,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
};
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
const NEW_DE: Record<number, { title: string; template: string }> = {
import { requireAuth } from '@/lib/auth';
  1: {
import { requireAuth } from '@/lib/auth';
    title: 'The Link (2 Stunden)',
import { requireAuth } from '@/lib/auth';
    template: `Hallo [Name],\n\nvielen Dank für Ihre Zeit heute, es war eine Freude Sie kennenzulernen.\n\nHier ist der Link zu unseren Sorten und Preisen:\n\n${CHEF_PAGE}\n\nIch würde mich freuen zu hören, was Sie denken. Zur Erinnerung: keine Lieferkosten, keine Mindestbestellung.\n\nGenießen Sie den Rest Ihres Abends.\nRon von Belarro`,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
  2: {
import { requireAuth } from '@/lib/auth';
    title: 'The Taste (2 Tage)',
import { requireAuth } from '@/lib/auth';
    template: `Hallo [Name],\n\nRon von Belarro. Ich hoffe, Sie hatten die Gelegenheit, die Proben zu probieren und zu sehen, wie sie zu Ihren Gerichten passen.\n\nWir wachsen nur, was Sie bestellen, kein alter Bestand, kein Abfall. Wir ernten am Morgen der Lieferung und unsere Microgreens bleiben bis zu 10 Tage frisch im Kühlschrank.\n\nLassen Sie mich wissen, was Ihr Interesse geweckt hat, und ich nehme es in den nächsten Anbauzyklus auf.\n\nRon von Belarro`,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
  3: {
import { requireAuth } from '@/lib/auth';
    title: 'The Facts (5 Tage)',
import { requireAuth } from '@/lib/auth';
    template: `Hallo [Name],\n\nRon von Belarro. Ich wollte nachfragen, wie Ihnen unsere Microgreens gefallen haben.\n\nWir bauen über 25 Sorten an, mehr Auswahl als die meisten Lieferanten, mehr Möglichkeiten für Ihre Teller. Bestellungen sind wiederkehrend: einmal bestellen, jeden Dienstag frisch erhalten. Sie können jederzeit ändern, hinzufügen oder stornieren.\n\nHier ist die vollständige Liste:\n\n${CHEF_PAGE}\n\nRon von Belarro`,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
  4: {
import { requireAuth } from '@/lib/auth';
    title: 'The Easy Yes (2 Wochen)',
import { requireAuth } from '@/lib/auth';
    template: `Hallo [Name],\n\nRon von Belarro. Ich habe noch nichts gehört und wollte kurz nachfragen.\n\nWir sind lokal. Keine Importe, schnelleres und konsistenteres Produkt, einfach frische Microgreens mit weniger Emissionen.\n\nKeine Mindestbestellung, keine Lieferkosten. Sagen Sie mir einfach, wann Sie bereit sind.\n\nRon von Belarro`,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
  5: {
import { requireAuth } from '@/lib/auth';
    title: 'The Open Door (1 Monat)',
import { requireAuth } from '@/lib/auth';
    template: `Hallo [Name],\n\nRon von Belarro. Kein Problem, wenn der Zeitpunkt nicht gepasst hat.\n\nWann immer Sie frische Microgreens benötigen, wir sind eine Nachricht entfernt. Keine Mindestbestellung, kostenlose Lieferung, geerntet am Morgen der Lieferung.\n\nUnsere Sorten und Preise finden Sie hier:\n\n${CHEF_PAGE}\n\nWir wünschen Ihnen eine großartige Saison.\nRon von Belarro`,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
};
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
// ─── RE-ENGAGE FLOW (visited > 30 days ago) ──────────────────────────────────
import { requireAuth } from '@/lib/auth';
// Stage numbers: 1=Re-Engage, 2=Follow Up, 3=Easy Yes, 4=Open Door
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
const REENGAGE_EN: Record<number, { title: string; template: string }> = {
import { requireAuth } from '@/lib/auth';
  1: {
import { requireAuth } from '@/lib/auth';
    title: 'Re-Engage',
import { requireAuth } from '@/lib/auth';
    template: `Hi [Name], Ron from Belarro. Berlin's precision indoor farm for professional kitchens. I stopped by [Restaurant] a while back and we're finally following up properly.\n\nWe've expanded significantly. We now grow 25+ varieties of microgreens, all harvested the morning of delivery. Unlike imported greens that spend days in transit, ours go straight from Prenzlauer Berg to your kitchen.\n\nEvery Tuesday\nNo delivery fees\nNo minimum order\n\nWant me to send over our current price list, or would you like some fresh samples next time I'm in your area?\n\nRon from Belarro`,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
  2: {
import { requireAuth } from '@/lib/auth';
    title: 'Re-Engage Follow Up (5 days)',
import { requireAuth } from '@/lib/auth';
    template: `Hello [Name],\n\nRon from Belarro. Just following up on my last message.\n\nWe grow over 25 varieties. Order once and receive fresh every week. You can always change, add or cancel. No minimums, no delivery fees.\n\nWhenever you are ready, we are one message away.\n\nRon from Belarro`,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
  3: {
import { requireAuth } from '@/lib/auth';
    title: 'The Easy Yes (2 weeks)',
import { requireAuth } from '@/lib/auth';
    template: NEW_EN[4].template,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
  4: {
import { requireAuth } from '@/lib/auth';
    title: 'The Open Door (1 month)',
import { requireAuth } from '@/lib/auth';
    template: NEW_EN[5].template,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
};
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
const REENGAGE_DE: Record<number, { title: string; template: string }> = {
import { requireAuth } from '@/lib/auth';
  1: {
import { requireAuth } from '@/lib/auth';
    title: 'Re-Engage',
import { requireAuth } from '@/lib/auth';
    template: `Hallo [Name], Ron von Belarro. Berlins Präzisions-Indoorfarm für professionelle Küchen. Ich war vor einer Weile bei [Restaurant] und melde mich jetzt endlich richtig zurück.\n\nWir haben uns stark weiterentwickelt. Wir bauen jetzt 25+ Sorten Microgreens an, alle am Morgen der Lieferung geerntet. Anders als importierte Greens, die tagelang unterwegs sind, kommen unsere direkt aus Prenzlauer Berg zu Ihnen.\n\nJeden Dienstag\nKeine Lieferkosten\nKeine Mindestbestellung\n\nSoll ich Ihnen unsere aktuelle Preisliste schicken, oder möchten Sie beim nächsten Mal, wenn ich in Ihrer Nähe bin, frische Muster probieren?\n\nRon von Belarro`,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
  2: {
import { requireAuth } from '@/lib/auth';
    title: 'Re-Engage Follow Up (5 Tage)',
import { requireAuth } from '@/lib/auth';
    template: `Hallo [Name],\n\nRon von Belarro. Ich melde mich kurz zu meiner letzten Nachricht.\n\nWir bauen über 25 Sorten an. Einmal bestellen und jede Woche frisch erhalten. Sie können jederzeit ändern, hinzufügen oder stornieren. Keine Mindestbestellung, keine Lieferkosten.\n\nWann immer Sie bereit sind, wir sind eine Nachricht entfernt.\n\nRon von Belarro`,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
  3: {
import { requireAuth } from '@/lib/auth';
    title: 'The Easy Yes (2 Wochen)',
import { requireAuth } from '@/lib/auth';
    template: NEW_DE[4].template,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
  4: {
import { requireAuth } from '@/lib/auth';
    title: 'The Open Door (1 Monat)',
import { requireAuth } from '@/lib/auth';
    template: NEW_DE[5].template,
import { requireAuth } from '@/lib/auth';
  },
import { requireAuth } from '@/lib/auth';
};
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
// ─── HELPERS ─────────────────────────────────────────────────────────────────
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
function buildMessage(flow: 'new' | 'reengage', stage: number, lang: string, contactName: string): { title: string; text: string } {
import { requireAuth } from '@/lib/auth';
  const name = contactName || 'there';
import { requireAuth } from '@/lib/auth';
  const isEN = lang === 'en';
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
  if (flow === 'reengage') {
import { requireAuth } from '@/lib/auth';
    const msg = isEN ? (REENGAGE_EN[stage] || REENGAGE_EN[1]) : (REENGAGE_DE[stage] || REENGAGE_DE[1]);
import { requireAuth } from '@/lib/auth';
    return { title: msg.title, text: msg.template.replace(/\[Name\]/g, name) };
import { requireAuth } from '@/lib/auth';
  } else {
import { requireAuth } from '@/lib/auth';
    const msg = isEN ? (NEW_EN[stage] || NEW_EN[1]) : (NEW_DE[stage] || NEW_DE[1]);
import { requireAuth } from '@/lib/auth';
    return { title: msg.title, text: msg.template.replace(/\[Name\]/g, name) };
import { requireAuth } from '@/lib/auth';
  }
import { requireAuth } from '@/lib/auth';
}
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
function parsePhone(raw: string | null): string | null {
import { requireAuth } from '@/lib/auth';
  if (!raw) return null;
import { requireAuth } from '@/lib/auth';
  return raw.replace(/\s+/g, '').replace(/^00/, '+');
import { requireAuth } from '@/lib/auth';
}
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
function isOldLead(timestamp: string | null, createdAt: string | null): boolean {
import { requireAuth } from '@/lib/auth';
  const dateStr = timestamp || createdAt;
import { requireAuth } from '@/lib/auth';
  if (!dateStr) return true;
import { requireAuth } from '@/lib/auth';
  const cleaned = String(dateStr).trim()
import { requireAuth } from '@/lib/auth';
    .replace(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/, '$3-$2-$1')
import { requireAuth } from '@/lib/auth';
    .replace(' ', 'T');
import { requireAuth } from '@/lib/auth';
  const date = new Date(cleaned);
import { requireAuth } from '@/lib/auth';
  if (isNaN(date.getTime())) return true;
import { requireAuth } from '@/lib/auth';
  const diffDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
import { requireAuth } from '@/lib/auth';
  return diffDays > OLD_LEAD_DAYS;
import { requireAuth } from '@/lib/auth';
}
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
// ─── GET ─────────────────────────────────────────────────────────────────────
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
    const followups = await fetchFromSupabase(
import { requireAuth } from '@/lib/auth';
      '/belarro_v4_follow_up?location_id=not.is.null&select=*&status=neq.skipped&order=due_date.asc'
import { requireAuth } from '@/lib/auth';
    );
import { requireAuth } from '@/lib/auth';
    const fls = followups || [];
import { requireAuth } from '@/lib/auth';
    if (fls.length === 0) return NextResponse.json({ success: true, data: [] });
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const locationIds = [...new Set(fls.map((f: any) => f.location_id))];
import { requireAuth } from '@/lib/auth';
    const idFilter = locationIds.map((id: any) => `id.eq.${id}`).join(',');
import { requireAuth } from '@/lib/auth';
    const locations = await fetchFromSupabase(
import { requireAuth } from '@/lib/auth';
      `/locations?or=(${idFilter})&archived=neq.YES&select=id,location_name,contact_person,direct_phone,business_phone,direct_email,business_email,language,visit_notes,pipeline_stage,interest_level,timestamp,created_at,sales_rep`
import { requireAuth } from '@/lib/auth';
    );
import { requireAuth } from '@/lib/auth';
    const locMap = new Map<string, any>((locations || []).map((l: any) => [l.id, l]));
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    // Only keep next pending follow-up per location
import { requireAuth } from '@/lib/auth';
    const nextPerLocation = new Map<string, any>();
import { requireAuth } from '@/lib/auth';
    for (const f of fls) {
import { requireAuth } from '@/lib/auth';
      const loc = locMap.get(f.location_id);
import { requireAuth } from '@/lib/auth';
      if (!loc) continue;
import { requireAuth } from '@/lib/auth';
      if (loc.pipeline_stage === 'active' || loc.pipeline_stage === 'snoozed') continue;
import { requireAuth } from '@/lib/auth';
      if (f.status !== 'pending' && f.status !== 'replied') continue;
import { requireAuth } from '@/lib/auth';
      const stage = f.stage || f.follow_up_number || 1;
import { requireAuth } from '@/lib/auth';
      const existing = nextPerLocation.get(f.location_id);
import { requireAuth } from '@/lib/auth';
      if (!existing || stage < (existing.stage || existing.follow_up_number || 1)) {
import { requireAuth } from '@/lib/auth';
        nextPerLocation.set(f.location_id, { ...f, stage });
import { requireAuth } from '@/lib/auth';
      }
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const hydrated = Array.from(nextPerLocation.values()).map((f: any) => {
import { requireAuth } from '@/lib/auth';
      const loc = locMap.get(f.location_id) || {};
import { requireAuth } from '@/lib/auth';
      const contactName = loc.contact_person || loc.location_name || 'there';
import { requireAuth } from '@/lib/auth';
      const phone = parsePhone(loc.direct_phone) || parsePhone(loc.business_phone);
import { requireAuth } from '@/lib/auth';
      const lang = (loc.language || '').toLowerCase().trim();
import { requireAuth } from '@/lib/auth';
      const flow: 'new' | 'reengage' = isOldLead(loc.timestamp, loc.created_at) ? 'reengage' : 'new';
import { requireAuth } from '@/lib/auth';
      const totalStages = flow === 'reengage' ? 4 : 5;
import { requireAuth } from '@/lib/auth';
      const { title, text } = buildMessage(flow, f.stage, lang, contactName);
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
      return {
import { requireAuth } from '@/lib/auth';
        ...f,
import { requireAuth } from '@/lib/auth';
        flow,
import { requireAuth } from '@/lib/auth';
        total_stages: totalStages,
import { requireAuth } from '@/lib/auth';
        message_title: title,
import { requireAuth } from '@/lib/auth';
        message_text: text,
import { requireAuth } from '@/lib/auth';
        whatsapp_number: phone,
import { requireAuth } from '@/lib/auth';
        visited_at: loc.timestamp || loc.created_at || null,
import { requireAuth } from '@/lib/auth';
        location: {
import { requireAuth } from '@/lib/auth';
          id: loc.id,
import { requireAuth } from '@/lib/auth';
          name: loc.location_name,
import { requireAuth } from '@/lib/auth';
          contact_person: loc.contact_person,
import { requireAuth } from '@/lib/auth';
          phone,
import { requireAuth } from '@/lib/auth';
          email: loc.direct_email || loc.business_email,
import { requireAuth } from '@/lib/auth';
          interest_level: loc.interest_level,
import { requireAuth } from '@/lib/auth';
          pipeline_stage: loc.pipeline_stage,
import { requireAuth } from '@/lib/auth';
          language: lang,
import { requireAuth } from '@/lib/auth';
          sales_rep: loc.sales_rep || null,
import { requireAuth } from '@/lib/auth';
        },
import { requireAuth } from '@/lib/auth';
      };
import { requireAuth } from '@/lib/auth';
    }).sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    // All completed stages for History tab — only ones actually sent (have sent_date or sent_via)
import { requireAuth } from '@/lib/auth';
    const completedRows = fls.filter((f: any) =>
import { requireAuth } from '@/lib/auth';
      (f.status === 'completed' || f.status === 'sent') &&
import { requireAuth } from '@/lib/auth';
      locMap.has(f.location_id) &&
import { requireAuth } from '@/lib/auth';
      (f.sent_date || f.sent_via)
import { requireAuth } from '@/lib/auth';
    );
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const completed = completedRows.map((f: any) => {
import { requireAuth } from '@/lib/auth';
      const loc = locMap.get(f.location_id) || {};
import { requireAuth } from '@/lib/auth';
      const lang = (loc.language || '').toLowerCase().trim();
import { requireAuth } from '@/lib/auth';
      const flow: 'new' | 'reengage' = isOldLead(loc.timestamp, loc.created_at) ? 'reengage' : 'new';
import { requireAuth } from '@/lib/auth';
      const { title, text } = buildMessage(flow, f.stage, lang, loc.contact_person || loc.location_name);
import { requireAuth } from '@/lib/auth';
      return {
import { requireAuth } from '@/lib/auth';
        ...f,
import { requireAuth } from '@/lib/auth';
        flow,
import { requireAuth } from '@/lib/auth';
        total_stages: flow === 'reengage' ? 4 : 5,
import { requireAuth } from '@/lib/auth';
        message_title: title,
import { requireAuth } from '@/lib/auth';
        message_text: text,
import { requireAuth } from '@/lib/auth';
        whatsapp_number: parsePhone(loc.direct_phone) || parsePhone(loc.business_phone),
import { requireAuth } from '@/lib/auth';
        visited_at: loc.timestamp || loc.created_at || null,
import { requireAuth } from '@/lib/auth';
        location: {
import { requireAuth } from '@/lib/auth';
          id: loc.id,
import { requireAuth } from '@/lib/auth';
          name: loc.location_name,
import { requireAuth } from '@/lib/auth';
          contact_person: loc.contact_person,
import { requireAuth } from '@/lib/auth';
          phone: parsePhone(loc.direct_phone) || parsePhone(loc.business_phone),
import { requireAuth } from '@/lib/auth';
          email: loc.direct_email || loc.business_email,
import { requireAuth } from '@/lib/auth';
          interest_level: loc.interest_level,
import { requireAuth } from '@/lib/auth';
          pipeline_stage: loc.pipeline_stage,
import { requireAuth } from '@/lib/auth';
          language: lang,
import { requireAuth } from '@/lib/auth';
        },
import { requireAuth } from '@/lib/auth';
      };
import { requireAuth } from '@/lib/auth';
    });
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    return NextResponse.json({ success: true, data: [...hydrated, ...completed] });
import { requireAuth } from '@/lib/auth';
  } catch (error) {
import { requireAuth } from '@/lib/auth';
    console.error('Followups GET error:', error);
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
    const { location_id, visited_at } = await request.json();
import { requireAuth } from '@/lib/auth';
    if (!location_id) return NextResponse.json({ success: false, error: 'location_id required' }, { status: 400 });
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const existing = await fetchFromSupabase(
import { requireAuth } from '@/lib/auth';
      `/belarro_v4_follow_up?location_id=eq.${location_id}&status=eq.pending&select=id&limit=1`
import { requireAuth } from '@/lib/auth';
    );
import { requireAuth } from '@/lib/auth';
    if (existing && existing.length > 0) {
import { requireAuth } from '@/lib/auth';
      return NextResponse.json({ success: false, error: 'Follow-ups already exist' }, { status: 409 });
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const base = new Date(visited_at || new Date()).getTime();
import { requireAuth } from '@/lib/auth';
    const old = isOldLead(visited_at, null);
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    const stages = old ? [
import { requireAuth } from '@/lib/auth';
      { stage: 1, follow_up_number: 1, follow_up_days: 0,  offset: 0 },
import { requireAuth } from '@/lib/auth';
      { stage: 2, follow_up_number: 2, follow_up_days: 5,  offset: 5  * 24 * 60 * 60 * 1000 },
import { requireAuth } from '@/lib/auth';
      { stage: 3, follow_up_number: 3, follow_up_days: 14, offset: 14 * 24 * 60 * 60 * 1000 },
import { requireAuth } from '@/lib/auth';
      { stage: 4, follow_up_number: 4, follow_up_days: 30, offset: 30 * 24 * 60 * 60 * 1000 },
import { requireAuth } from '@/lib/auth';
    ] : [
import { requireAuth } from '@/lib/auth';
      { stage: 1, follow_up_number: 1, follow_up_days: 0,  offset: 2 * 60 * 60 * 1000 },
import { requireAuth } from '@/lib/auth';
      { stage: 2, follow_up_number: 2, follow_up_days: 2,  offset: 2  * 24 * 60 * 60 * 1000 },
import { requireAuth } from '@/lib/auth';
      { stage: 3, follow_up_number: 3, follow_up_days: 5,  offset: 5  * 24 * 60 * 60 * 1000 },
import { requireAuth } from '@/lib/auth';
      { stage: 4, follow_up_number: 4, follow_up_days: 14, offset: 14 * 24 * 60 * 60 * 1000 },
import { requireAuth } from '@/lib/auth';
      { stage: 5, follow_up_number: 5, follow_up_days: 30, offset: 30 * 24 * 60 * 60 * 1000 },
import { requireAuth } from '@/lib/auth';
    ];
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    for (const s of stages) {
import { requireAuth } from '@/lib/auth';
      await fetchFromSupabase('/belarro_v4_follow_up', {
import { requireAuth } from '@/lib/auth';
        method: 'POST',
import { requireAuth } from '@/lib/auth';
        body: JSON.stringify({
import { requireAuth } from '@/lib/auth';
          id: crypto.randomUUID(),
import { requireAuth } from '@/lib/auth';
          location_id,
import { requireAuth } from '@/lib/auth';
          follow_up_number: s.follow_up_number,
import { requireAuth } from '@/lib/auth';
          follow_up_days: s.follow_up_days,
import { requireAuth } from '@/lib/auth';
          stage: s.stage,
import { requireAuth } from '@/lib/auth';
          due_date: new Date(base + s.offset).toISOString(),
import { requireAuth } from '@/lib/auth';
          status: 'pending',
import { requireAuth } from '@/lib/auth';
        }),
import { requireAuth } from '@/lib/auth';
      });
import { requireAuth } from '@/lib/auth';
    }
import { requireAuth } from '@/lib/auth';

import { requireAuth } from '@/lib/auth';
    return NextResponse.json({ success: true });
import { requireAuth } from '@/lib/auth';
  } catch (error) {
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
