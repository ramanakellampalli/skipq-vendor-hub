import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, AlertCircle } from 'lucide-react-native';
import { useVendorStore } from '../../store/vendorStore';
import { colors, radius, spacing } from '../../theme';
import { computeMonthlySummary, buildMonthlySummaryHtml } from '../../utils/invoiceHtml';
import { generateAndSharePdf } from '../../utils/pdfExport';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function fmt(n: number): string {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowLabelBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function EarningsScreen({ navigation }: any) {
  const pastOrders = useVendorStore(state => state.pastOrders);
  const profile = useVendorStore(state => state.profile);

  const now = new Date();

  const earliestOrder = useMemo(() => {
    const completed = pastOrders.filter(o => o.state.orderStatus === 'COMPLETED');
    if (completed.length === 0) return null;
    return completed.reduce((min, o) =>
      o.timeline.createdAt < min ? o.timeline.createdAt : min,
      completed[0].timeline.createdAt,
    );
  }, [pastOrders]);

  const minYear = earliestOrder ? new Date(earliestOrder).getFullYear() : now.getFullYear();
  const minMonth = earliestOrder ? new Date(earliestOrder).getMonth() : now.getMonth();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const [downloading, setDownloading] = useState(false);

  const summary = useMemo(
    () => computeMonthlySummary(pastOrders, year, month),
    [pastOrders, year, month],
  );

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const isEarliestMonth = year === minYear && month === minMonth;

  function prevMonth() {
    if (isEarliestMonth) return;
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  async function handleDownload() {
    if (!summary || !profile) return;
    setDownloading(true);
    try {
      const html = buildMonthlySummaryHtml(summary, profile);
      const mm = String(month + 1).padStart(2, '0');
      await generateAndSharePdf(html, `gst-summary-${year}-${mm}`);
    } catch {
      Alert.alert('Export Failed', 'Could not generate the summary. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  const hasData = summary.orderCount > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <ArrowLeft size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Period navigator */}
        <View style={styles.periodRow}>
          <TouchableOpacity
            onPress={prevMonth}
            style={[styles.chevron, isEarliestMonth && styles.chevronDisabled]}
            disabled={isEarliestMonth}>
            <ChevronLeft size={20} color={isEarliestMonth ? colors.border : colors.navy} />
          </TouchableOpacity>
          <Text style={styles.periodLabel}>{MONTH_NAMES[month]} {year}</Text>
          <TouchableOpacity
            onPress={nextMonth}
            style={[styles.chevron, isCurrentMonth && styles.chevronDisabled]}
            disabled={isCurrentMonth}>
            <ChevronRight size={20} color={isCurrentMonth ? colors.border : colors.navy} />
          </TouchableOpacity>
        </View>

        {/* Hero — net payout */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>GROSS EARNINGS</Text>
          <Text style={styles.heroAmount}>{fmt(summary.grossRevenue)}</Text>
          <Text style={styles.heroSub}>
            {hasData
              ? `from ${summary.orderCount} completed order${summary.orderCount === 1 ? '' : 's'}`
              : 'No completed orders this month'}
          </Text>
        </View>

        {/* Revenue section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>REVENUE</Text>
          <Row label="Gross Revenue" value={fmt(summary.grossRevenue)} />
          <Row label="Orders Completed" value={String(summary.orderCount)} />
        </View>

        {/* GST section — only show if vendor is GST registered */}
        {profile?.gstRegistered && (
          <View style={[styles.card, styles.gstCard]}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.cardTitle, styles.gstTitle]}>GST COLLECTED</Text>
              <View style={styles.remitBadge}>
                <AlertCircle size={11} color="#EA580C" />
                <Text style={styles.remitText}>Remit to govt</Text>
              </View>
            </View>
            <Row label="CGST (2.5%)" value={fmt(summary.cgst)} />
            <Row label="SGST (2.5%)" value={fmt(summary.sgst)} />
            <Divider />
            <Row label="Total GST" value={fmt(summary.totalTax)} bold />
          </View>
        )}

        {/* Download CTA */}
        {profile?.gstRegistered && (
          <TouchableOpacity
            style={[styles.downloadBtn, downloading && styles.downloadBtnDisabled]}
            onPress={handleDownload}
            disabled={downloading}
            activeOpacity={0.85}>
            {downloading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Download size={18} color="#fff" />
                <Text style={styles.downloadText}>Download GST Summary PDF</Text>
              </>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  back: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.navy },

  scroll: { padding: spacing.md, gap: spacing.md, paddingBottom: 40 },

  /* Period navigator */
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chevron: { padding: 4 },
  chevronDisabled: { opacity: 0.4 },
  periodLabel: { fontSize: 17, fontWeight: '700', color: colors.navy },

  /* Hero card */
  hero: {
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    paddingVertical: 28,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: 6,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },

  /* Generic card */
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  /* GST card variant */
  gstCard: {
    backgroundColor: '#FFFBF5',
    borderColor: '#FDBA74',
  },
  gstTitle: { color: '#C2410C' },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  remitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  remitText: { fontSize: 11, fontWeight: '600', color: '#EA580C' },

  /* Row */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 14, color: colors.textSecondary },
  rowLabelBold: { fontWeight: '700', color: colors.textPrimary },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.navy },
  rowValueBold: { fontSize: 15, fontWeight: '800', color: colors.navy },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },

  /* Download button */
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 16,
    marginTop: 4,
  },
  downloadBtnDisabled: { opacity: 0.6 },
  downloadText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
