import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useMutation } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react-native';
import { api } from '../../api';
import { colors, radius, spacing } from '../../theme';
import { Order, OrderStatus } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { useVendorStore } from '../../store/vendorStore';
import { timeAgo } from '../../utils/time';

const CARD_ACTIONS: Partial<Record<OrderStatus, { next?: OrderStatus; reject?: boolean; label?: string }>> = {
  PENDING:   { next: 'ACCEPTED', reject: true, label: 'Accept' },
  ACCEPTED:  { next: 'PREPARING', label: 'Start Preparing' },
  PREPARING: { next: 'READY', label: 'Mark Ready' },
  READY:     { next: 'COMPLETED', label: 'Complete' },
};

function statusSummary(orders: Order[]): string {
  const counts: Partial<Record<string, number>> = {};
  for (const o of orders) {
    const key =
      o.state.orderStatus === 'PENDING' ? 'pending' :
      o.state.orderStatus === 'ACCEPTED' || o.state.orderStatus === 'PREPARING' ? 'preparing' :
      o.state.orderStatus === 'READY' ? 'ready' : null;
    if (key) counts[key] = (counts[key] ?? 0) + 1;
  }
  const parts = (['pending', 'preparing', 'ready'] as const)
    .filter(k => counts[k])
    .map(k => `${counts[k]} ${k}`);
  return parts.length ? parts.join(' · ') : 'No active orders';
}

export default function OrdersScreen({ navigation }: any) {
  const profile = useVendorStore(state => state.profile);
  const activeOrders = useVendorStore(state => state.activeOrders);
  const setProfile = useVendorStore(state => state.setProfile);
  const setSync = useVendorStore(state => state.setSync);
  const upsertOrder = useVendorStore(state => state.upsertOrder);
  const isSynced = useVendorStore(state => state.isSynced);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const toggleOpen = useMutation({
    mutationFn: (isOpen: boolean) => api.vendor.updateProfile({ isOpen }),
    onSuccess: data => setProfile(data.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      api.orders.updateStatus(orderId, status),
    onSuccess: res => upsertOrder(res.data),
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
    },
  });

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { data } = await api.vendor.sync();
      setSync(data);
    } finally {
      setIsRefreshing(false);
    }
  }, [setSync]);

  const closeSwipeable = (orderId: string) => {
    swipeableRefs.current.get(orderId)?.close();
  };

  const renderAdvanceAction = (item: Order, next: OrderStatus, label: string) => (
    <TouchableOpacity
      style={[styles.swipeAction, styles.swipeAdvance]}
      onPress={() => {
        closeSwipeable(item.id);
        updateStatus.mutate({ orderId: item.id, status: next });
      }}>
      <Text style={styles.swipeLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderRejectAction = (item: Order) => (
    <TouchableOpacity
      style={[styles.swipeAction, styles.swipeReject]}
      onPress={() => {
        closeSwipeable(item.id);
        Alert.alert('Reject Order', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: () => updateStatus.mutate({ orderId: item.id, status: 'REJECTED' }),
          },
        ]);
      }}>
      <Text style={styles.swipeLabel}>Reject</Text>
    </TouchableOpacity>
  );

  const renderOrder = ({ item }: { item: Order }) => {
    const actions = CARD_ACTIONS[item.state.orderStatus];

    return (
      <Swipeable
        ref={ref => {
          if (ref) swipeableRefs.current.set(item.id, ref);
          else swipeableRefs.current.delete(item.id);
        }}
        friction={2}
        overshootFriction={8}
        renderLeftActions={
          actions?.next
            ? () => renderAdvanceAction(item, actions.next!, actions.label ?? actions.next!)
            : undefined
        }
        renderRightActions={
          actions?.reject ? () => renderRejectAction(item) : undefined
        }>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          activeOpacity={0.8}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
            <StatusBadge status={item.state.orderStatus} />
          </View>
          <Text style={styles.items} numberOfLines={2}>
            {item.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.total}>₹{item.pricing.totalAmount.toFixed(2)}</Text>
            <Text style={styles.time}>{timeAgo(item.timeline.createdAt)}</Text>
          </View>

          {actions && (
            <View style={styles.cardActions}>
              {actions.reject && (
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() =>
                    Alert.alert('Reject Order', 'Are you sure?', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Reject',
                        style: 'destructive',
                        onPress: () => updateStatus.mutate({ orderId: item.id, status: 'REJECTED' }),
                      },
                    ])
                  }>
                  <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
              )}
              {actions.next && (
                <TouchableOpacity
                  style={[styles.actionButton, !actions.reject && styles.actionButtonFull]}
                  onPress={() => updateStatus.mutate({ orderId: item.id, status: actions.next! })}
                  disabled={updateStatus.isPending}>
                  <Text style={styles.actionText}>{actions.label ?? actions.next}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  if (!isSynced) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.storeName}>{profile?.name ?? 'My Store'}</Text>
          <Text style={styles.headerSub}>{statusSummary(activeOrders)}</Text>
        </View>
        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, { color: profile?.isOpen ? colors.success : colors.textSecondary }]}>
            {profile?.isOpen ? 'Open' : 'Closed'}
          </Text>
          <Switch
            value={profile?.isOpen ?? false}
            onValueChange={val => toggleOpen.mutate(val)}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor={colors.surface}
          />
        </View>
      </View>

      <FlatList
        data={activeOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={
          activeOrders.length === 0 ? styles.emptyContainer : styles.listContent
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
            <ClipboardList size={56} color={colors.border} />
            <Text style={styles.emptyTitle}>No active orders</Text>
            <Text style={styles.emptySubtitle}>
              New orders will appear here in real time
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  storeName: { fontSize: 20, fontWeight: '700', color: colors.navy },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: { fontSize: 13, fontWeight: '600' },
  listContent: { padding: spacing.md, gap: spacing.sm },
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
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    borderRadius: radius.md,
    marginVertical: 2,
  },
  swipeAdvance: { backgroundColor: colors.success },
  swipeReject: { backgroundColor: colors.error },
  swipeLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
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
  time: { fontSize: 13, color: colors.textSecondary },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionButtonFull: { flex: 1 },
  actionText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  rejectButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rejectText: { color: colors.error, fontSize: 14, fontWeight: '700' },
});
