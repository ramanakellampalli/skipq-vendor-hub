import { Order, MonthlySummary, VendorProfile } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const BASE_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1A1A2E; font-size: 13px; line-height: 1.6; background: #fff; }

  .header { background: #1A2332; padding: 28px 36px; display: flex; justify-content: space-between; align-items: center; }
  .brand { color: #FF7F00; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
  .brand-sub { color: rgba(255,255,255,0.45); font-size: 10px; margin-top: 2px; letter-spacing: 0.5px; }
  .doc-type { text-align: right; }
  .doc-type h2 { color: #fff; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .doc-type p { color: rgba(255,255,255,0.55); font-size: 11px; margin-top: 4px; }

  .body { padding: 32px 36px; }

  .label { font-size: 10px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }

  .footer { padding: 16px 36px; border-top: 1px solid #F0F0F0; font-size: 10px; color: #9CA3AF; text-align: center; letter-spacing: 0.3px; }
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
  const hasTax = order.pricing.tax.totalTax > 0;

  const itemRows = order.items.map((i, idx) => `
    <tr style="background:${idx % 2 === 0 ? '#fff' : '#FAFAFA'}">
      <td style="padding:10px 12px;border-bottom:1px solid #F0F0F0;">
        ${i.name}${i.variantLabel ? ` <span style="color:#9CA3AF;font-size:11px;">(${i.variantLabel})</span>` : ''}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #F0F0F0;text-align:center;color:#6B7280;">9963</td>
      <td style="padding:10px 12px;border-bottom:1px solid #F0F0F0;text-align:center;font-weight:600;">${i.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #F0F0F0;text-align:right;color:#6B7280;">${fmt(i.unitPrice)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #F0F0F0;text-align:right;font-weight:600;">${fmt(i.subtotal)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    ${BASE_STYLES}
    .parties { display: flex; gap: 40px; margin-bottom: 28px; padding-bottom: 28px; border-bottom: 1px solid #F0F0F0; }
    .party { flex: 1; }
    .party-name { font-size: 15px; font-weight: 700; color: #1A2332; margin-bottom: 3px; }
    .party-detail { font-size: 12px; color: #6B7280; margin-top: 2px; }
    .party-gstin { display: inline-block; margin-top: 6px; font-size: 11px; font-weight: 600; color: #374151; background: #F3F4F6; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #F0F0F0; border-radius: 6px; overflow: hidden; }
    th { background: #1A2332; color: rgba(255,255,255,0.7); padding: 10px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
    .totals { margin-left: auto; width: 260px; }
    .t-row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 13px; color: #6B7280; border-bottom: 1px solid #F5F5F5; }
    .t-row span:last-child { font-weight: 600; color: #374151; }
    .t-total { display: flex; justify-content: space-between; padding: 12px 14px; margin-top: 10px; background: #1A2332; border-radius: 6px; font-size: 15px; font-weight: 700; color: #fff; }
    .t-total span:last-child { color: #FF7F00; }
  </style></head><body>
    <div class="header">
      <div>
        <div class="brand">SkipQ</div>
        <div class="brand-sub">CAMPUS FOOD ORDERING</div>
      </div>
      <div class="doc-type">
        <h2>Tax Invoice</h2>
        <p>Invoice #: ${order.id.slice(0, 8).toUpperCase()}</p>
        <p>Date: ${formatDate(order.timeline.createdAt)}</p>
      </div>
    </div>

    <div class="body">
      <div class="parties">
        <div class="party">
          <div class="label">Seller</div>
          <div class="party-name">${profile.businessName || profile.name}</div>
          <div class="party-detail">${profile.campusName || ''}</div>
          ${profile.gstin ? `<div class="party-gstin">GSTIN: ${profile.gstin}</div>` : ''}
        </div>
        <div class="party">
          <div class="label">Buyer</div>
          <div class="party-name">Customer</div>
          <div class="party-detail">${profile.campusName || ''}</div>
        </div>
      </div>

      <table>
        <thead><tr>
          <th style="text-align:left;">Item Description</th>
          <th style="text-align:center;">HSN</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Unit Price</th>
          <th style="text-align:right;">Amount</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div class="totals">
        <div class="t-row"><span>Subtotal</span><span>${fmt(order.pricing.subtotal)}</span></div>
        ${hasTax ? `
          <div class="t-row"><span>CGST (2.5%)</span><span>${fmt(order.pricing.tax.cgst)}</span></div>
          <div class="t-row"><span>SGST (2.5%)</span><span>${fmt(order.pricing.tax.sgst)}</span></div>
        ` : ''}
        <div class="t-total"><span>Total Amount</span><span>${fmt(order.pricing.totalAmount)}</span></div>
      </div>
    </div>

    <div class="footer">Computer-generated invoice &nbsp;·&nbsp; SkipQ Campus Food Ordering &nbsp;·&nbsp; ${formatDate(order.timeline.createdAt)}</div>
  </body></html>`;
}

export function buildMonthlySummaryHtml(summary: MonthlySummary, profile: VendorProfile): string {
  const period = `${MONTH_NAMES[summary.month]} ${summary.year}`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    ${BASE_STYLES}
    .vendor-card { background: #F8F9FA; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; }
    .vendor-name { font-size: 16px; font-weight: 700; color: #1A2332; }
    .vendor-detail { font-size: 12px; color: #6B7280; margin-top: 3px; }
    .vendor-gstin { display: inline-block; margin-top: 8px; font-size: 11px; font-weight: 600; color: #374151; background: #E5E7EB; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px; }
    .period-badge { background: #1A2332; color: #FF7F00; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; white-space: nowrap; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 2px solid #1A2332; display: inline-block; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F3F4F6; }
    .row-label { color: #6B7280; font-size: 13px; }
    .row-value { font-weight: 600; color: #1A2332; font-size: 13px; }
    .gst-box { background: #FFF8F0; border: 1px solid #FED7AA; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; }
    .gst-box-title { font-size: 11px; font-weight: 700; color: #C2410C; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .gst-note { font-size: 11px; color: #EA580C; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #FED7AA; }
    .gst-total-row { display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid #FED7AA; font-weight: 700; color: #92400E; font-size: 14px; }
    .summary-total { background: #1A2332; border-radius: 8px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
    .summary-total-label { color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-total-value { color: #FF7F00; font-size: 22px; font-weight: 800; }
  </style></head><body>
    <div class="header">
      <div>
        <div class="brand">SkipQ</div>
        <div class="brand-sub">CAMPUS FOOD ORDERING</div>
      </div>
      <div class="doc-type">
        <h2>GST Monthly Summary</h2>
        <p>${period}</p>
      </div>
    </div>

    <div class="body">
      <div class="vendor-card">
        <div>
          <div class="label">Vendor</div>
          <div class="vendor-name">${profile.businessName || profile.name}</div>
          <div class="vendor-detail">${profile.campusName || ''}</div>
          ${profile.gstin ? `<div class="vendor-gstin">GSTIN: ${profile.gstin}</div>` : ''}
        </div>
        <div class="period-badge">${period}</div>
      </div>

      <div class="section">
        <div class="section-title">Revenue Overview</div>
        <div class="row"><span class="row-label">Orders Completed</span><span class="row-value">${summary.orderCount}</span></div>
        <div class="row"><span class="row-label">Gross Revenue</span><span class="row-value">${fmt(summary.grossRevenue)}</span></div>
      </div>

      <div class="gst-box">
        <div class="gst-box-title">GST Collected — Remit to Government</div>
        <div class="row" style="padding:6px 0;border-bottom:1px solid #FED7AA;"><span class="row-label" style="color:#92400E;">CGST Collected (2.5%)</span><span class="row-value" style="color:#92400E;">${fmt(summary.cgst)}</span></div>
        <div class="row" style="padding:6px 0;border-bottom:none;"><span class="row-label" style="color:#92400E;">SGST Collected (2.5%)</span><span class="row-value" style="color:#92400E;">${fmt(summary.sgst)}</span></div>
        <div class="gst-total-row"><span>Total GST Payable</span><span>${fmt(summary.totalTax)}</span></div>
        <div class="gst-note">Remit the above amount to the government when filing your GST returns for ${period}.</div>
      </div>

      <div class="summary-total">
        <div>
          <div class="summary-total-label">Total Earnings</div>
          <div style="color:rgba(255,255,255,0.45);font-size:11px;margin-top:2px;">${period}</div>
        </div>
        <div class="summary-total-value">${fmt(summary.grossRevenue)}</div>
      </div>
    </div>

    <div class="footer">Generated by SkipQ &nbsp;·&nbsp; ${period} &nbsp;·&nbsp; For informational and GST filing purposes only</div>
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

  const cgst = completed.reduce((s, o) => s + o.pricing.tax.cgst, 0);
  const sgst = completed.reduce((s, o) => s + o.pricing.tax.sgst, 0);
  const grossRevenue = completed.reduce((s, o) => s + o.pricing.subtotal + o.pricing.tax.totalTax, 0);

  return {
    year, month,
    orderCount: completed.length,
    grossRevenue,
    cgst, sgst,
    totalTax: cgst + sgst,
  };
}
