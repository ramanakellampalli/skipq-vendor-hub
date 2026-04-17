import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react-native';
import { api } from '../../api';
import { colors, radius, spacing, status as statusMap } from '../../theme';
import { Order } from '../../types';
import StatusBadge from '../../components/StatusBadge';

export default function OrdersScreen({ navigation }: any) {
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.vendor.getProfile().then(r => r.data),
  });

  const { data: orders = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['vendorOrders'],
    queryFn: () => api.orders.getAll().then(r => r.data),
    refetchInterval: 15000,
  });

  const toggleOpen = useMutation({
    mutationFn: (isOpen: boolean) =>
      api.vendor.updateProfile({ isOpen }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  const activeOrders = orders.filter(
    o => !['COMPLETED', 'REJECTED'].includes(o.status),
  );

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>
          #{item.id.slice(0, 8).toUpperCase()}
        </Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.items}>
        {item.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.total}>₹{item.totalAmount.toFixed(2)}</Text>
        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.storeName}>{profile?.name ?? 'My Store'}</Text>
          <Text style={styles.headerSub}>
            {activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''}
          </Text>
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

      {/* Orders List */}
      <FlatList
        data={activeOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={
          activeOrders.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
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
});
