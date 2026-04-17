import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { status as statusMap, radius } from '../theme';
import { OrderStatus } from '../types';

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusMap[status] ?? { color: '#9CA3AF', label: status };
  return (
    <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  label: { fontSize: 12, fontWeight: '600' },
});
