import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useMutation } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react-native';
import { api } from '../../api';
import { colors, radius, spacing } from '../../theme';
import { Order, OrderStatus } from '../../types';
import { useVendorStore } from '../../store/vendorStore';
import { timeAgo } from '../../utils/time';

type Filter = 'ALL' | 'NEW' | 'PREPARING' | 'READY';

const FILTER_LABELS: Record<Filter, string> = {
  ALL: 'All',
  NEW: 'New',
  PREPARING: 'Preparing',
  READY: 'Ready',
};

const STATUS_BANNER: Partial<Record<OrderStatus, { label: string; color: string }>> = {
  PENDING:   { label: 'NEW ORDER',        color: colors.primary },
  ACCEPTED:  { label: 'ACCEPTED',         color: '#2563EB' },
  PREPARING: { label: 'PREPARING',        color: '#D97706' },
  READY:     { label: 'READY FOR PICKUP', color: colors.success },
};

const CARD_ACTIONS: Partial<Record<OrderStatus, { next?: OrderStatus; reject?: boolean; label: string }>> = {
  PENDING:   { next: 'ACCEPTED',  reject: true, label: 'Accept' },
  ACCEPTED:  { next: 'PREPARING', label: 'Start Preparing' },
  PREPARING: { next: 'READY',     label: 'Mark Ready' },
  READY:     { next: 'COMPLETED', label: 'Complete' },
};

function orderTime(createdAt: string) {
  return new Date(createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function OrdersScreen({ navigation }: any) {
  const activeOrders = useVendorStore(state => state.activeOrders);
  const profile      = useVendorStore(state => state.profile);
  const setSync      = useVendorStore(state => state.setSync);
  const upsertOrder  = useVendorStore(state => state.upsertOrder);
  const isSynced     = useVendorStore(state => state.isSynced);

  const [filter, setFilter]         = useState<Filter>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

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

  const counts = useMemo(() => ({
    ALL:       activeOrders.length,
    NEW:       activeOrders.filter(o => o.state.orderStatus === 'PENDING').length,
    PREPARING: activeOrders.filter(o => ['ACCEPTED', 'PREPARING'].includes(o.state.orderStatus)).length,
    READY:     activeOrders.filter(o => o.state.orderStatus === 'READY').length,
  }), [activeOrders]);

  const filteredOrders = useMemo(() => {
    switch (filter) {
      case 'NEW':       return activeOrders.filter(o => o.state.orderStatus === 'PENDING');
      case 'PREPARING': return activeOrders.filter(o => ['ACCEPTED', 'PREPARING'].includes(o.state.orderStatus));
      case 'READY':     return activeOrders.filter(o => o.state.orderStatus === 'READY');
      default:          return activeOrders;
    }
  }, [activeOrders, filter]);

  const handleReject = (orderId: string) => {
    swipeableRefs.current.get(orderId)?.close();
    Alert.alert('Reject Order', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => updateStatus.mutate({ orderId, status: 'REJECTED' }) },
    ]);
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const actions = CARD_ACTIONS[item.state.orderStatus];
    const banner  = STATUS_BANNER[item.state.orderStatus];
    const isPending = item.state.orderStatus === 'PENDING';

    return (
      <Swipeable
        ref={ref => {
          if (ref) swipeableRefs.current.set(item.id, ref);
          else swipeableRefs.current.delete(item.id);
        }}
        friction={2}
        overshootFriction={8}
        renderRightActions={
          actions?.reject
            ? () => (
                <TouchableOpacity
                  style={styles.swipeReject}
                  onPress={() => handleReject(item.id)}>
                  <Text style={styles.swipeLabel}>Reject</Text>
                </TouchableOpacity>
              )
            : undefined
        }>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.card, isPending && styles.cardPending]}
          onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>

          {banner && (
            <View style={[styles.banner, { backgroundColor: banner.color }]}>
              <View style={styles.bannerLeft}>
                <View style={styles.bannerDot} />
                <Text style={styles.bannerLabel}>{banner.label}</Text>
              </View>
              <Text style={styles.bannerTime}>{timeAgo(item.timeline.createdAt)}</Text>
            </View>
          )}

          <View style={styles.cardBody}>
            <View style={styles.refRow}>
              <Text style={styles.orderRef}>#{item.id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.orderTime}>{orderTime(item.timeline.createdAt)}</Text>
            </View>

            <View style={styles.divider} />

            {item.items.map((i, idx) => (
              <Text key={idx} style={styles.itemLine}>
                {i.quantity}× {i.name}{i.variantLabel ? ` (${i.variantLabel})` : ''}
              </Text>
            ))}

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
              <Text style={styles.total}>₹{item.pricing.totalAmount.toFixed(0)}</Text>
              {actions && (
                <View style={styles.footerActions}>
                  {actions.reject && (
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleReject(item.id)}>
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                  )}
                  {actions.next && (
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      disabled={updateStatus.isPending}
                      onPress={() => updateStatus.mutate({ orderId: item.id, status: actions.next! })}>
                      <Text style={styles.acceptText}>
                        {actions.label}
                        {isPending && profile?.prepTime ? ` · ${profile.prepTime}m prep` : ''}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
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
          <Text style={styles.title}>Live orders</Text>
          <Text style={styles.subtitle}>
            {counts.ALL} active{counts.NEW > 0 ? ` · ${counts.NEW} incoming` : ''}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}>
        {(Object.keys(FILTER_LABELS) as Filter[]).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}
            style={[styles.chip, filter === f && styles.chipActive]}>
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {FILTER_LABELS[f]}{counts[f] > 0 ? ` · ${counts[f]}` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={
          filteredOrders.length === 0 ? styles.emptyContainer : styles.listContent
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
            <Text style={styles.emptySubtitle}>New orders will appear here in real time</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title:    { fontSize: 22, fontWeight: '800', color: colors.navy },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

  filterScroll: {
    flexGrow: 0,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  chipText:       { fontSize: 13, fontWeight: '600', color: colors.navy },
  chipTextActive: { color: '#fff' },

  listContent:    { padding: spacing.md, gap: spacing.md },
  emptyContainer: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: spacing.sm,
  },
  emptyTitle:    { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

  swipeReject: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: radius.md,
    marginVertical: 0,
  },
  swipeLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardPending: {
    borderColor: colors.primary,
  },

  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  bannerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bannerDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  bannerLabel: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.8 },
  bannerTime:  { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },

  cardBody: { padding: spacing.md, gap: spacing.sm },

  refRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderRef:  { fontSize: 18, fontWeight: '800', color: colors.navy },
  orderTime: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },

  divider: { height: 1, backgroundColor: colors.border },

  itemLine: { fontSize: 14, color: colors.textPrimary, lineHeight: 22 },

  cardFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total:        { fontSize: 17, fontWeight: '800', color: colors.navy },
  footerActions:{ flexDirection: 'row', gap: spacing.sm },

  rejectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  rejectText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },

  acceptBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.sm,
    backgroundColor: colors.navy,
  },
  acceptText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
