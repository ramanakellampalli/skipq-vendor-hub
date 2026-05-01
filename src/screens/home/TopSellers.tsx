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
          <View key={seller.menuItemId} style={styles.card}>
            <View style={styles.rowTop}>
              <Text style={styles.rank}>{String(i + 1).padStart(2, '0')}</Text>
              <View style={styles.imagePlaceholder} />
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>{seller.name}</Text>
                  <Text style={styles.revenue}>₹{seller.revenue.toFixed(0)}</Text>
                </View>
                <Text style={styles.sold}>{seller.quantity} sold</Text>
              </View>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${(seller.quantity / maxQty) * 100}%` as any }]} />
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.navy },
  manageText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  empty: { paddingVertical: spacing.lg, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.md,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  rank: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, width: 20 },
  imagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: '#F5EFE6',
  },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '600', color: colors.navy, flex: 1, marginRight: 8 },
  revenue: { fontSize: 15, fontWeight: '700', color: colors.navy },
  sold: { fontSize: 12, color: colors.primary, fontWeight: '600', marginTop: 2 },
  barBg: { height: 3, backgroundColor: colors.border, marginLeft: 40 },
  barFill: { height: 3, backgroundColor: colors.primary },
});
