import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { useVendorStore } from '../../store/vendorStore';
import { ServiceRequest, ServiceRequestStatus, ServiceRequestType } from '../../types';
import { colors, radius, spacing } from '../../theme';

const TYPE_LABELS: Record<ServiceRequestType, string> = {
  PAYMENT_ISSUE: 'Payment Issue',
  PAYOUT_ISSUE:  'Payout Issue',
  BILLING_ISSUE: 'Billing Issue',
  ACCOUNT_ISSUE: 'Account Issue',
  REFUND_ISSUE:  'Refund Issue',
  TECHNICAL:     'Technical',
  OTHER:         'Other',
};

const STATUS_COLORS: Record<ServiceRequestStatus, { bg: string; text: string }> = {
  OPEN:        { bg: '#FFF3E0', text: '#E65100' },
  IN_PROGRESS: { bg: '#E3F2FD', text: '#1565C0' },
  RESOLVED:    { bg: '#E8F5E9', text: '#2E7D32' },
  CLOSED:      { bg: '#F3F4F6', text: colors.textSecondary },
};

const STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  OPEN:        'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED:    'Resolved',
  CLOSED:      'Closed',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function RequestCard({ sr }: { sr: ServiceRequest }) {
  const { bg, text } = STATUS_COLORS[sr.status];
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.subject} numberOfLines={1}>{TYPE_LABELS[sr.type] ?? sr.type}</Text>
        <View style={[styles.badge, { backgroundColor: bg }]}>
          <Text style={[styles.badgeText, { color: text }]}>{STATUS_LABELS[sr.status]}</Text>
        </View>
      </View>
      <Text style={styles.date}>{formatDate(sr.createdAt)}</Text>
      {sr.adminResponse ? (
        <View style={styles.responseBox}>
          <Text style={styles.responseLabel}>Admin response</Text>
          <Text style={styles.responseText}>{sr.adminResponse}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function SupportScreen() {
  const navigation = useNavigation<any>();
  const serviceRequests = useVendorStore(state => state.serviceRequests);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {serviceRequests.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptySubtitle}>Tap the button below to contact support.</Text>
          </View>
        ) : (
          serviceRequests.map(sr => <RequestCard key={sr.id} sr={sr} />)
        )}
      </ScrollView>

      <View style={styles.fabWrap}>
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('NewSupportRequest')}>
          <Plus size={20} color="#fff" />
          <Text style={styles.fabText}>New Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.navy },
  backBtn: { width: 60 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  content: { padding: spacing.md, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  subject: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  badgeText: { fontSize: 12, fontWeight: '700' },
  date: { fontSize: 12, color: colors.textSecondary },
  responseBox: {
    marginTop: spacing.sm,
    backgroundColor: '#F0FDF4',
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 2,
  },
  responseLabel: { fontSize: 11, fontWeight: '700', color: colors.success, textTransform: 'uppercase', letterSpacing: 0.3 },
  responseText: { fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
  fabWrap: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
  },
  fab: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
  },
  fabText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
