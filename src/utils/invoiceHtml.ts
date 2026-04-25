import { Order, MonthlySummary, VendorProfile } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const BASE_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 32px; color: #111827; font-size: 13px; line-height: 1.6; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #FF7F00; padding-bottom: 20px; margin-bottom: 24px; }
  .brand { font-size: 22px; font-weight: 700; color: #FF7F00; letter-spacing: -0.5px; }
  .brand-sub { font-size: 11px; color: #6B7280; margin-top: 3px; }
  .meta { text-align: right; }
  .meta h2 { font-size: 15px; color: #1A2332; font-weight: 700; }
  .meta p { font-size: 12px; color: #6B7280; margin-top: 4px; }
  .label { font-size: 10px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF; text-align: center; }
`;

function fmt(n: number): string {
  return `₹${n.toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function buildOrderInvoiceHtml(order: Order, profile: VendorProfile): string {
  const itemRows = order.items
    .map(i => `
      <tr>
        <td>${i.name}${i.variantLabel ? ` <span class="variant">(${i.variantLabel})</span>` : ''}</td>
        <td class="c">9963</td>
        <td class="c">${i.quantity}</td>
        <td class="r">${fmt(i.unitPrice)}</td>
        <td class="r">${fmt(i.subtotal)}</td>
      </tr>`)
    .join('');

  const hasTax = order.pricing.tax.totalTax > 0;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    ${BASE_STYLES}
    .parties { display: flex; justify-content: space-between; margin-bottom: 28px; }
    .party { width: 48%; }
    .party-name { font-size: 15px; font-weight: 700; color: #1A2332; }
    .party-detail { font-size: 12px; color: #6B7280; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #F8F9FA; padding: 10px 12px; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E5E7EB; }
    td { padding: 10px 12px; border-bottom: 1px solid #F3F4F6; }
    .variant { color: #6B7280; font-size: 12px; }
    .c { text-align: center; }
    .r { text-align: right; }
    .totals { margin-left: auto; width: 280px; }
    .t-row { display: flex; justify-content: space-between; padding: 6px 0; color: #374151; }
    .t-div { border-top: 1px solid #E5E7EB; margin: 8px 0; }
    .t-total { display: flex; justify-content: space-between; padding: 10px 0 0; font-size: 15px; font-weight: 700; color: #1A2332; }
  </style></head><body>
    <div class="top">
      <div><div class="brand">SkipQ</div><div class="brand-sub">Campus Food Ordering</div></div>
      <div class="meta">
        <h2>TAX INVOICE</h2>
        <p>Invoice #: ${order.id.slice(0, 8).toUpperCase()}</p>
        <p>Date: ${formatDate(order.timeline.createdAt)}</p>
      </div>
    </div>
    <div class="parties">
      <div class="party">
        <div class="label">Seller</div>
        <div class="party-name">${profile.businessName || profile.name}</div>
        <div class="party-detail">${profile.campusName || ''}</div>
        ${profile.gstin ? `<div class="party-detail">GSTIN: ${profile.gstin}</div>` : ''}
      </div>
      <div class="party">
        <div class="label">Buyer</div>
        <div class="party-name">Customer</div>
        <div class="party-detail">${profile.campusName || ''}</div>
      </div>
    </div>
    <table>
      <thead><tr>
        <th>Item</th><th class="c">HSN</th><th class="c">Qty</th>
        <th class="r">Unit Price</th><th class="r">Amount</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div class="totals">
      <div class="t-row"><span>Subtotal</span><span>${fmt(order.pricing.subtotal)}</span></div>
      ${hasTax ? `
        <div class="t-row"><span>CGST (2.5%)</span><span>${fmt(order.pricing.tax.cgst)}</span></div>
        <div class="t-row"><span>SGST (2.5%)</span><span>${fmt(order.pricing.tax.sgst)}</span></div>
      ` : ''}
      <div class="t-row"><span>Platform Fee (3%)</span><span>${fmt(order.pricing.fees.platformFee)}</span></div>
      <div class="t-div"></div>
      <div class="t-total"><span>Total</span><span>${fmt(order.pricing.totalAmount)}</span></div>
    </div>
    <div class="footer">Computer-generated invoice · Thank you for ordering on SkipQ</div>
  </body></html>`;
}

export function buildMonthlySummaryHtml(summary: MonthlySummary, profile: VendorProfile): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    ${BASE_STYLES}
    .vendor-block { margin-bottom: 28px; }
    .vendor-name { font-size: 15px; font-weight: 700; color: #1A2332; }
    .vendor-detail { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F3F4F6; }
    .row-label { color: #6B7280; }
    .row-value { font-weight: 600; color: #111827; }
    .divider { border-top: 2px solid #E5E7EB; margin: 16px 0; }
    .gst-note { background: #FFF7ED; border-radius: 8px; padding: 10px 14px; margin: 12px 0; font-size: 12px; color: #EA580C; }
    .total-row { display: flex; justify-content: space-between; padding: 12px 0 0; font-size: 15px; font-weight: 700; color: #1A2332; }
    .section-gap { margin-top: 20px; }
  </style></head><body>
    <div class="top">
      <div><div class="brand">SkipQ</div><div class="brand-sub">Campus Food Ordering</div></div>
      <div class="meta">
        <h2>GST MONTHLY SUMMARY</h2>
        <p>${MONTH_NAMES[summary.month]} ${summary.year}</p>
      </div>
    </div>
    <div class="vendor-block">
      <div class="label">Vendor</div>
      <div class="vendor-name">${profile.businessName || profile.name}</div>
      <div class="vendor-detail">${profile.campusName || ''}</div>
      ${profile.gstin ? `<div class="vendor-detail">GSTIN: ${profile.gstin}</div>` : ''}
    </div>
    <div class="label">Summary</div>
    <div class="row"><span class="row-label">Total Orders Completed</span><span class="row-value">${summary.orderCount}</span></div>
    <div class="row"><span class="row-label">Gross Revenue</span><span class="row-value">${fmt(summary.grossRevenue)}</span></div>
    <div class="divider"></div>
    <div class="label section-gap">GST Collected — Remit to Government</div>
    <div class="gst-note">Remit this amount when filing your GST returns for ${MONTH_NAMES[summary.month]} ${summary.year}.</div>
    <div class="row"><span class="row-label">CGST Collected (2.5%)</span><span class="row-value">${fmt(summary.cgst)}</span></div>
    <div class="row"><span class="row-label">SGST Collected (2.5%)</span><span class="row-value">${fmt(summary.sgst)}</span></div>
    <div class="row"><span class="row-label">Total GST</span><span class="row-value">${fmt(summary.totalTax)}</span></div>
    <div class="divider"></div>
    <div class="row"><span class="row-label">Platform Fees Paid to SkipQ (3%)</span><span class="row-value">${fmt(summary.platformFees)}</span></div>
    <div class="total-row"><span>Net Payout</span><span>${fmt(summary.netPayout)}</span></div>
    <div class="footer">Generated by SkipQ · ${MONTH_NAMES[summary.month]} ${summary.year} · For informational purposes only</div>
  </body></html>`;
}

export function computeMonthlySummary(
  orders: Order[],
  year: number,
  month: number,
): MonthlySummary {
  const completed = orders.filter(o => {
    if (o.state.orderStatus !== 'COMPLETED') return false;
    const d = new Date(o.timeline.createdAt);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const grossRevenue = completed.reduce((s, o) => s + o.pricing.totalAmount, 0);
  const cgst = completed.reduce((s, o) => s + o.pricing.tax.cgst, 0);
  const sgst = completed.reduce((s, o) => s + o.pricing.tax.sgst, 0);
  const platformFees = completed.reduce((s, o) => s + o.pricing.fees.platformFee, 0);

  return {
    year, month,
    orderCount: completed.length,
    grossRevenue,
    cgst, sgst,
    totalTax: cgst + sgst,
    platformFees,
    netPayout: grossRevenue - platformFees,
  };
}
