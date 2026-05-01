import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { QueueCounts } from '../../utils/orderStats';

const MAX_DOTS = 12;

interface Props {
  counts: QueueCounts;
  onViewAll: () => void;
}

export default function LiveQueue({ counts, onViewAll }: Props) {
  const filled = Math.min(counts.total, MAX_DOTS);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.queueLabel}>LIVE QUEUE</Text>
        <TouchableOpacity style={styles.viewAllBtn} onPress={onViewAll} activeOpacity={0.8}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.count}>
        <Text style={styles.countNum}>{counts.total}</Text>
        {' '}
        <Text style={styles.countSub}>orders waiting</Text>
      </Text>

      <View style={styles.dots}>
        {Array.from({ length: MAX_DOTS }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < filled ? styles.dotFilled : styles.dotEmpty]}
          />
        ))}
      </View>

      <View style={styles.breakdown}>
        {counts.preparing > 0 && (
          <Text style={styles.breakdownText}>Preparing: <Text style={styles.breakdownNum}>{counts.preparing}</Text></Text>
        )}
        {counts.accepted > 0 && (
          <Text style={styles.breakdownText}>Accepted: <Text style={styles.breakdownNum}>{counts.accepted}</Text></Text>
        )}
        {counts.ready > 0 && (
          <Text style={styles.breakdownText}>Ready: <Text style={styles.breakdownNum}>{counts.ready}</Text></Text>
        )}
        {counts.total === 0 && (
          <Text style={styles.breakdownText}>No active orders</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.8,
  },
  viewAllBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  viewAllText: { fontSize: 13, fontWeight: '700', color: colors.surface },
  count: { flexDirection: 'row', alignItems: 'baseline' },
  countNum: { fontSize: 36, fontWeight: '800', color: colors.surface },
  countSub: { fontSize: 16, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  dots: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotFilled: { backgroundColor: colors.primary },
  dotEmpty: { backgroundColor: 'rgba(255,255,255,0.15)' },
  breakdown: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  breakdownText: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  breakdownNum: { color: colors.surface, fontWeight: '700' },
});
