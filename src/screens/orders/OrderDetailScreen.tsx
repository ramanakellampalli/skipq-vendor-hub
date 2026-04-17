import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react-native';
import { api } from '../../api';
import { colors, radius, spacing } from '../../theme';
import { OrderStatus } from '../../types';
import StatusBadge from '../../components/StatusBadge';

const STATUS_ACTIONS: Record<OrderStatus, { next?: OrderStatus; reject?: boolean }> = {
  PENDING: { next: 'ACCEPTED', reject: true },
  ACCEPTED: { next: 'PREPARING' },
  PREPARING: { next: 'READY' },
  READY: { next: 'COMPLETED' },
  COMPLETED: {},
  REJECTED: {},
};

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  ACCEPTED: 'Accept Order',
  PREPARING: 'Start Preparing',
  READY: 'Mark Ready',
  COMPLETED: 'Complete Order',
};

export default function OrderDetailScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['vendorOrders'],
    queryFn: () => api.orders.getAll().then(r => r.data),
  });

  const order = orders.find(o => o.id === orderId);

  const updateStatus = useMutation({
    mutationFn: (status: OrderStatus) =>
      api.orders.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
    },
  });

  if (!order) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const actions = STATUS_ACTIONS[order.status];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <ArrowLeft size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          #{order.id.slice(0, 8).toUpperCase()}
        </Text>
        <StatusBadge status={order.status} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.itemPrice}>₹{item.subtotal.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ₹{order.totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Placed at</Text>
            <Text style={styles.infoValue}>
              {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Est. ready</Text>
            <Text style={styles.infoValue}>
              {new Date(order.estimatedReadyAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>{order.paymentStatus}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {(actions.next || actions.reject) && (
        <View style={styles.actions}>
          {actions.reject && (
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() =>
                Alert.alert('Reject Order', 'Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: () => updateStatus.mutate('REJECTED'),
                  },
                ])
              }>
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
          )}
          {actions.next && (
            <TouchableOpacity
              style={[styles.actionButton, !actions.reject && { flex: 1 }]}
              onPress={() => updateStatus.mutate(actions.next!)}
              disabled={updateStatus.isPending}>
              {updateStatus.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionText}>
                  {ACTION_LABELS[actions.next] ?? actions.next}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  back: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.navy },
  content: { padding: spacing.md, gap: spacing.md },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 15, color: colors.textPrimary },
  itemPrice: { fontSize: 15, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border },
  totalLabel: { fontSize: 15, fontWeight: '700', color: colors.navy },
  totalValue: { fontSize: 15, fontWeight: '700', color: colors.navy },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 14, color: colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  actions: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rejectButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rejectText: { color: colors.error, fontSize: 16, fontWeight: '700' },
});
