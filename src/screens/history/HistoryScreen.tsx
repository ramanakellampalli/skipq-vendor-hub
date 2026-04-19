import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { History } from 'lucide-react-native';
import { api } from '../../api';
import { colors, radius, spacing } from '../../theme';
import { Order } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { useVendorStore } from '../../store/vendorStore';
import { timeAgo } from '../../utils/time';

type Filter = 'today' | 'yesterday' | 'week' | 'all';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'Last 7 days' },
  { key: 'all', label: 'All' },
];

function startOf(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function applyFilter(orders: Order[], filter: Filter): Order[] {
  const now = new Date();
  const todayStart = startOf(now).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;

  return orders.filter(o => {
    const t = new Date(o.timeline.createdAt).getTime();
    if (filter === 'today') return t >= todayStart;
    if (filter === 'yesterday') return t >= yesterdayStart && t < todayStart;
    if (filter === 'week') return t >= weekStart;
    return true;
  });
}

export default function HistoryScreen({ navigation }: any) {
  const pastOrders = useVendorStore(state => state.pastOrders);
  const setSync = useVendorStore(state => state.setSync);
  const [activeFilter, setActiveFilter] = useState<Filter>('today');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = useMemo(() => applyFilter(pastOrders, activeFilter), [pastOrders, activeFilter]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { data } = await api.vendor.sync();
      setSync(data);
    } finally {
      setIsRefreshing(false);
    }
  }, [setSync]);

  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Orders', { screen: 'OrderDetail', params: { orderId: item.id } })}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
        <StatusBadge status={item.state.orderStatus} />
      </View>
      <Text style={styles.items} numberOfLines={2}>
        {item.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.total}>₹{item.pricing.totalAmount.toFixed(2)}</Text>
        <Text style={styles.date}>{timeAgo(item.timeline.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerSub}>
          {filtered.length} order{filtered.length !== 1 ? 's' : ''}
          {activeFilter !== 'all' ? ` · ${FILTERS.find(f => f.key === activeFilter)?.label}` : ''}
        </Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.pill, activeFilter === f.key && styles.pillActive]}
            onPress={() => setActiveFilter(f.key)}>
            <Text style={[styles.pillText, activeFilter === f.key && styles.pillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <History size={56} color={colors.border} />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? 'Completed orders will appear here'
                : 'Try a different date range'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.navy },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  pillTextActive: { color: '#fff' },
  list: { padding: spacing.md, gap: spacing.sm },
  emptyContainer: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: spacing.sm,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: { fontSize: 15, fontWeight: '700', color: colors.navy },
  items: { fontSize: 14, color: colors.textSecondary },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  date: { fontSize: 13, color: colors.textSecondary },
});
