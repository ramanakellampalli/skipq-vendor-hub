import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { TopSeller } from '../../utils/orderStats';

interface Props {
  sellers: TopSeller[];
  onManageMenu: () => void;
}

export default function TopSellers({ sellers, onManageMenu }: Props) {
  const maxQty = sellers[0]?.quantity ?? 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Top sellers</Text>
        <TouchableOpacity onPress={onManageMenu} activeOpacity={0.7}>
          <Text style={styles.manageText}>Manage menu</Text>
        </TouchableOpacity>
      </View>

      {sellers.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No sales yet</Text>
        </View>
      ) : (
        sellers.map((seller, i) => (
          <View key={seller.menuItemId} style={styles.row}>
            <Text style={styles.rank}>{String(i + 1).padStart(2, '0')}</Text>
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>{seller.name}</Text>
                <Text style={styles.revenue}>₹{seller.revenue.toFixed(0)}</Text>
              </View>
              <Text style={styles.sold}>{seller.quantity} sold</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${(seller.quantity / maxQty) * 100}%` }]} />
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.navy },
manageText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  empty: { paddingVertical: spacing.lg, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.textSecondary },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  rank: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, width: 22, marginTop: 2 },
  info: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '600', color: colors.navy, flex: 1 },
  revenue: { fontSize: 15, fontWeight: '700', color: colors.navy },
  sold: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  barBg: { height: 3, backgroundColor: colors.border, borderRadius: 2, marginTop: 2 },
  barFill: { height: 3, backgroundColor: colors.primary, borderRadius: 2 },
});
