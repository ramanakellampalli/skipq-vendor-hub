import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Props {
  label: string;
  value: string;
  highlight?: boolean;
}

export default function SummaryCard({ label, value, highlight }: Props) {
  return (
    <View style={[styles.card, highlight && styles.highlight]}>
      <Text style={[styles.label, highlight && styles.labelHighlight]}>{label}</Text>
      <Text style={[styles.value, highlight && styles.valueHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  highlight: { backgroundColor: '#FFF7ED', borderColor: '#FBBF24' },
  label: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  labelHighlight: { color: '#92400E' },
  value: { fontSize: 18, fontWeight: '700', color: colors.navy },
  valueHighlight: { color: '#B45309' },
});
