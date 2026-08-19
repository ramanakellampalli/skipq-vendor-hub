import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { ArrowLeft, AlertTriangle } from 'lucide-react-native';
import { useVendorStore } from '../../store/vendorStore';
import { SubscriptionPayment, SubscriptionStatus } from '../../types';
import { colors, radius, spacing } from '../../theme';

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatMonth(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric',
  });
}

const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; bg: string; text: string }> = {
  ACTIVE:    { label: 'Active',    bg: '#DCFCE7', text: '#16A34A' },
  PAST_DUE:  { label: 'Past Due',  bg: '#FEE2E2', text: '#DC2626' },
  SUSPENDED: { label: 'Suspended', bg: '#FEF3C7', text: '#D97706' },
};

function SubscriptionBadge({ status }: { status: SubscriptionStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

function PaymentRow({ payment, last }: { payment: SubscriptionPayment; last: boolean }) {
  return (
    <View style={[styles.paymentRow, !last && styles.paymentRowBorder]}>
      <View style={styles.paymentLeft}>
        <Text style={styles.paymentMonth}>{formatMonth(payment.paidForMonth)}</Text>
        <Text style={styles.paymentDate}>Received {formatDate(payment.paidOn)}</Text>
        {payment.paymentReference && (
          <Text style={styles.paymentRef}>Ref: {payment.paymentReference}</Text>
        )}
      </View>
      <Text style={styles.paymentAmount}>
        ₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>
    </View>
  );
}

export default function SubscriptionScreen({ navigation }: any) {
  const subscription = useVendorStore(s => s.profile?.subscription);
  const payments = useVendorStore(s => s.subscriptionPayments);

  const isPastDue = subscription?.status === 'PAST_DUE';
  const isFree = (subscription?.monthlyPrice ?? 0) === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <ArrowLeft size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {isPastDue && (
          <View style={styles.banner}>
            <AlertTriangle size={18} color="#DC2626" />
            <Text style={styles.bannerText}>
              Subscription payment due. Contact SkipQ support to continue using the platform.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>PLAN STATUS</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Status</Text>
            {subscription ? (
              <SubscriptionBadge status={subscription.status} />
            ) : (
              <Text style={styles.rowValue}>—</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Monthly Fee</Text>
            <Text style={styles.rowValue}>
              {isFree ? 'Free' : `₹${subscription!.monthlyPrice.toLocaleString('en-IN')}/month`}
            </Text>
          </View>

          {!isFree && (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Paid Through</Text>
                <Text style={styles.rowValue}>
                  {subscription?.paidThrough ? formatDate(subscription.paidThrough) : 'No payment recorded'}
                </Text>
              </View>
            </>
          )}

          {!isFree && subscription?.lastPaymentReference && (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Last Reference</Text>
                <Text style={[styles.rowValue, styles.refText]}>{subscription.lastPaymentReference}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>PAYMENT HISTORY</Text>
          {payments.length > 0 ? (
            payments.map((p, i) => (
              <PaymentRow key={p.id} payment={p} last={i === payments.length - 1} />
            ))
          ) : (
            <Text style={styles.emptyText}>No payments recorded yet.</Text>
          )}
        </View>

        <Text style={styles.note}>
          Payments are recorded by the SkipQ team after offline collection. Contact support for any discrepancies.
        </Text>

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

  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
    fontWeight: '500',
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowLabel: { fontSize: 15, color: colors.textPrimary },
  rowValue: { fontSize: 15, color: colors.textSecondary, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  refText: { fontFamily: 'monospace', fontSize: 13 },
  divider: { height: 1, backgroundColor: colors.border },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: { fontSize: 13, fontWeight: '700' },

  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  paymentRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paymentLeft: { flex: 1, gap: 2 },
  paymentMonth: { fontSize: 15, fontWeight: '600', color: colors.navy },
  paymentDate: { fontSize: 12, color: colors.textSecondary },
  paymentRef: { fontSize: 11, color: colors.textSecondary, fontFamily: 'monospace' },
  paymentAmount: { fontSize: 15, fontWeight: '700', color: colors.navy, marginLeft: spacing.md },

  emptyText: { fontSize: 14, color: colors.textSecondary, paddingVertical: spacing.sm },

  note: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },
});
