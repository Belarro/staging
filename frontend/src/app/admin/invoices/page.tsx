'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface InvoiceLine {
  id: string;
  order_id: string;
  delivery_date: string;
  crop_name: string;
  size_name: string;
  qty: number;
  unit_price: number;
  line_total: number;
  removed: boolean;
  qty_override: number | null;
}

interface CustomerInvoice {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  customer_tax_number: string;
  net_days: number;
  month: string;
  lines: InvoiceLine[];
  subtotal: number;
  vat: number;
  total: number;
}

function fmtDate(s: string) {
  return new Date(s + 'T00:00:00').toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

function fmtMonth(s: string) {
  const [y, m] = s.split('-');
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('en-DE', { month: 'long', year: 'numeric' });
}

function calcTotals(lines: InvoiceLine[]) {
  const subtotal = lines
    .filter(l => !l.removed)
    .reduce((s, l) => {
      const qty = l.qty_override ?? l.qty;
      return s + +(qty * l.unit_price).toFixed(2);
    }, 0);
  return {
    subtotal: +subtotal.toFixed(2),
    vat: +(subtotal * 0.07).toFixed(2),
    total: +(subtotal * 1.07).toFixed(2),
  };
}

export default function InvoicesPage() {
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const [month, setMonth] = useState(defaultMonth);
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editedLines, setEditedLines] = useState<Record<string, InvoiceLine[]>>({});

  const load = useCallback(async (m: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/generate?month=${m}`);
      const json = await res.json();
      if (json.success) {
        setInvoices(json.data);
        // Reset edits when month changes
        const initial: Record<string, InvoiceLine[]> = {};
        for (const inv of json.data) {
          initial[inv.customer_id] = inv.lines.map((l: InvoiceLine) => ({ ...l }));
        }
        setEditedLines(initial);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(month); }, [month, load]);

  const getLines = (customerId: string) => editedLines[customerId] || [];

  const toggleRemove = (customerId: string, lineId: string) => {
    setEditedLines(prev => ({
      ...prev,
      [customerId]: prev[customerId].map(l => l.id === lineId ? { ...l, removed: !l.removed } : l),
    }));
  };

  const setQtyOverride = (customerId: string, lineId: string, val: string) => {
    const n = val === '' ? null : parseInt(val);
    setEditedLines(prev => ({
      ...prev,
      [customerId]: prev[customerId].map(l => l.id === lineId ? { ...l, qty_override: n } : l),
    }));
  };

  const handlePrint = (inv: CustomerInvoice) => {
    const lines = getLines(inv.customer_id);
    const { subtotal, vat, total } = calcTotals(lines);
    const activeLines = lines.filter(l => !l.removed);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Invoice ${fmtMonth(inv.month)} — ${inv.customer_name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 40px; }
    h1 { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
    .meta { color: #555; font-size: 11px; margin-bottom: 24px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .from p, .to p { line-height: 1.6; }
    .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; border-bottom: 2px solid #000; padding: 6px 8px; }
    td { padding: 7px 8px; border-bottom: 1px solid #eee; }
    tr:last-child td { border-bottom: none; }
    .right { text-align: right; }
    .totals { margin-top: 24px; margin-left: auto; width: 260px; }
    .totals tr td { border: none; padding: 4px 8px; }
    .totals .total-row td { font-weight: bold; font-size: 14px; border-top: 2px solid #000; padding-top: 8px; }
    .footer { margin-top: 40px; font-size: 10px; color: #888; }
  </style>
</head>
<body>
  <div class="header">
    <div class="from">
      <p class="label">From</p>
      <p><strong>Belarro / Citfarm UG</strong></p>
      <p>Berlin, Germany</p>
    </div>
    <div class="to">
      <p class="label">Bill To</p>
      <p><strong>${inv.customer_name}</strong></p>
      ${inv.customer_address ? `<p>${inv.customer_address}</p>` : ''}
      ${inv.customer_email ? `<p>${inv.customer_email}</p>` : ''}
      ${inv.customer_tax_number ? `<p>VAT: ${inv.customer_tax_number}</p>` : ''}
    </div>
    <div>
      <p class="label">Invoice Period</p>
      <p><strong>${fmtMonth(inv.month)}</strong></p>
      <p class="label" style="margin-top:12px">Payment Terms</p>
      <p>Net ${inv.net_days} days</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Product</th>
        <th class="right">Qty</th>
        <th class="right">Unit Price</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${activeLines.map(l => {
        const qty = l.qty_override ?? l.qty;
        const lineTotal = (qty * l.unit_price).toFixed(2);
        return `<tr>
          <td>${fmtDate(l.delivery_date)}</td>
          <td>${l.crop_name}${l.size_name ? ` (${l.size_name})` : ''}</td>
          <td class="right">${qty}</td>
          <td class="right">€${l.unit_price.toFixed(2)}</td>
          <td class="right">€${lineTotal}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  <table class="totals">
    <tr><td>Subtotal</td><td class="right">€${subtotal.toFixed(2)}</td></tr>
    <tr><td>VAT (7%)</td><td class="right">€${vat.toFixed(2)}</td></tr>
    <tr class="total-row"><td>Total</td><td class="right">€${total.toFixed(2)}</td></tr>
  </table>

  <div class="footer">
    <p>Generated ${new Date().toLocaleDateString('de-DE')} · Citfarm UG · Berlin</p>
  </div>
</body>
</html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Auto-generated from active orders. Edit lines before printing.</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          min="2026-06"
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">
          No active orders found for {fmtMonth(month)}.
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map(inv => {
            const lines = getLines(inv.customer_id);
            const { subtotal, vat, total } = calcTotals(lines);
            const isOpen = openId === inv.customer_id;
            const activeCount = lines.filter(l => !l.removed).length;

            return (
              <div key={inv.customer_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Header row — click to expand */}
                <button
                  onClick={() => setOpenId(isOpen ? null : inv.customer_id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900 text-base">{inv.customer_name}</span>
                    <span className="text-xs text-gray-400">{activeCount} deliveries</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Subtotal</div>
                      <div className="font-semibold text-gray-700">€{subtotal.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">VAT 7%</div>
                      <div className="font-semibold text-gray-700">€{vat.toFixed(2)}</div>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <div className="text-xs text-gray-400">Total</div>
                      <div className="font-bold text-gray-900 text-base">€{total.toFixed(2)}</div>
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded: editable line items */}
                {isOpen && (
                  <div className="border-t border-gray-100">
                    <table className="w-full text-sm table-fixed">
                      <colgroup>
                        <col className="w-32" />
                        <col className="w-auto" />
                        <col className="w-20" />
                        <col className="w-24" />
                        <col className="w-24" />
                        <col className="w-20" />
                      </colgroup>
                      <thead>
                        <tr className="text-xs font-semibold text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Product</th>
                          <th className="px-4 py-2 text-right">Qty</th>
                          <th className="px-4 py-2 text-right">Unit Price</th>
                          <th className="px-4 py-2 text-right">Line Total</th>
                          <th className="px-4 py-2 text-center">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {lines.map(line => {
                          const qty = line.qty_override ?? line.qty;
                          const lineTotal = (qty * line.unit_price).toFixed(2);
                          return (
                            <tr key={line.id} className={`${line.removed ? 'opacity-30 bg-gray-50' : 'hover:bg-gray-50'}`}>
                              <td className="px-4 py-2.5 text-gray-500 text-xs">{fmtDate(line.delivery_date)}</td>
                              <td className="px-4 py-2.5 font-medium text-gray-900">
                                {line.crop_name}
                                {line.size_name && <span className="text-gray-400 text-xs ml-1">({line.size_name})</span>}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <input
                                  type="number"
                                  min="1"
                                  value={line.qty_override ?? line.qty}
                                  onChange={e => setQtyOverride(inv.customer_id, line.id, e.target.value)}
                                  disabled={line.removed}
                                  className="w-14 text-center text-xs border border-gray-200 rounded px-1 py-1 outline-none focus:border-green-400 disabled:opacity-40"
                                />
                              </td>
                              <td className="px-4 py-2.5 text-right text-gray-600">€{line.unit_price.toFixed(2)}</td>
                              <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                                {line.removed ? '—' : `€${lineTotal}`}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <button
                                  onClick={() => toggleRemove(inv.customer_id, line.id)}
                                  className={`text-xs font-semibold px-2 py-1 rounded transition ${
                                    line.removed
                                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                                  }`}
                                >
                                  {line.removed ? 'Restore' : '✕'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Footer with totals + print */}
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex gap-6 text-sm">
                        <span className="text-gray-500">Subtotal: <strong className="text-gray-900">€{subtotal.toFixed(2)}</strong></span>
                        <span className="text-gray-500">VAT 7%: <strong className="text-gray-900">€{vat.toFixed(2)}</strong></span>
                        <span className="text-gray-500">Total: <strong className="text-gray-900 text-base">€{total.toFixed(2)}</strong></span>
                      </div>
                      <button
                        onClick={() => handlePrint({ ...inv, lines })}
                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition"
                      >
                        Print Invoice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
