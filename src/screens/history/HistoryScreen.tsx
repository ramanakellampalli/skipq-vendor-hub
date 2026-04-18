import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { History } from 'lucide-react-native';
import { api } from '../../api';
import { colors, radius, spacing } from '../../theme';
import { Order } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { useVendorStore } from '../../store/vendorStore';
import { timeAgo } from '../../utils/time';

export default function HistoryScreen({ navigation }: any) {
  const pastOrders = useVendorStore(state => state.pastOrders);
  const setSync = useVendorStore(state => state.setSync);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.items} numberOfLines={2}>
        {item.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.total}>₹{item.totalAmount.toFixed(2)}</Text>
        <Text style={styles.date}>{timeAgo(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerSub}>{pastOrders.length} order{pastOrders.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={pastOrders}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          pastOrders.length === 0 ? styles.emptyContainer : styles.list
        }
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
            <Text style={styles.emptyTitle}>No order history yet</Text>
            <Text style={styles.emptySubtitle}>
              Completed orders will appear here
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
