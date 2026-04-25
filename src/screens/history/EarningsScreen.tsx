import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { ArrowLeft, Download } from 'lucide-react-native';
import { useVendorStore } from '../../store/vendorStore';
import { colors, radius, spacing } from '../../theme';
import { computeMonthlySummary, buildMonthlySummaryHtml } from '../../utils/invoiceHtml';
import { generateAndSharePdf } from '../../utils/pdfExport';
import SummaryCard from '../../components/SummaryCard';

const now = new Date();

export default function EarningsScreen({ navigation }: any) {
  const pastOrders = useVendorStore(state => state.pastOrders);
  const profile = useVendorStore(state => state.profile);
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [downloading, setDownloading] = useState(false);

  const summary = useMemo(() => {
    const m = parseInt(month, 10) - 1;
    const y = parseInt(year, 10);
    if (isNaN(m) || isNaN(y) || m < 0 || m > 11 || y < 2020) return null;
    return computeMonthlySummary(pastOrders, y, m);
  }, [pastOrders, month, year]);

  const handleDownload = async () => {
    if (!summary || !profile) return;
    setDownloading(true);
    try {
      const html = buildMonthlySummaryHtml(summary, profile);
      await generateAndSharePdf(html, `gst-summary-${year}-${month.padStart(2, '0')}`);
    } catch {
      Alert.alert('Export Failed', 'Could not generate the summary. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <ArrowLeft size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Period input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Period</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Month</Text>
              <TextInput
                style={styles.input}
                value={month}
                onChangeText={setMonth}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="1–12"
                placeholderTextColor={colors.border}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Year</Text>
              <TextInput
                style={styles.input}
                value={year}
                onChangeText={setYear}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="2026"
                placeholderTextColor={colors.border}
              />
            </View>
          </View>
        </View>

        {summary ? (
          <>
            {/* Summary grid */}
            <View style={styles.grid}>
              <SummaryCard label="Orders" value={String(summary.orderCount)} />
              <SummaryCard label="Gross Revenue" value={`₹${summary.grossRevenue.toFixed(2)}`} />
            </View>
            <View style={styles.grid}>
              <SummaryCard label="CGST Collected" value={`₹${summary.cgst.toFixed(2)}`} />
              <SummaryCard label="SGST Collected" value={`₹${summary.sgst.toFixed(2)}`} />
            </View>
            <View style={styles.grid}>
              <SummaryCard label="Platform Fees" value={`₹${summary.platformFees.toFixed(2)}`} />
              <SummaryCard label="Net Payout" value={`₹${summary.netPayout.toFixed(2)}`} highlight />
            </View>

            {/* GST download — only for registered vendors */}
            {profile?.gstRegistered && (
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={handleDownload}
                disabled={downloading}
                activeOpacity={0.8}>
                {downloading
                  ? <ActivityIndicator color={colors.primary} size="small" />
                  : <>
                      <Download size={16} color={colors.primary} />
                      <Text style={styles.downloadText}>Download GST Summary PDF</Text>
                    </>}
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Enter a valid month (1–12) and year.</Text>
          </View>
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
  content: { padding: spacing.md, gap: spacing.md },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  inputGroup: { flex: 1, gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  grid: { flexDirection: 'row', gap: spacing.sm },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    backgroundColor: '#FFF7ED',
    marginTop: spacing.xs,
  },
  downloadText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  empty: { alignItems: 'center', paddingTop: spacing.xl },
  emptyText: { fontSize: 14, color: colors.textSecondary },
});
