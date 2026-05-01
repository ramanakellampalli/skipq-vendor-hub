import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme';

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

interface Props {
  orderCount: number;
  revenue: number;
}

export default function StatsGrid({ orderCount, revenue }: Props) {
  return (
    <View style={styles.row}>
      <StatCard
        label="TODAY'S ORDERS"
        value={String(orderCount)}
        sub="Completed"
      />
      <StatCard
        label="REVENUE"
        value={`₹${revenue.toFixed(0)}`}
        sub="Today's earnings"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.navy,
  },
  sub: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
