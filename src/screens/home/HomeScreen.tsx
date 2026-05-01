import React, { useMemo } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet, StatusBar, RefreshControl } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useVendorStore } from '../../store/vendorStore';
import { api } from '../../api';
import { colors, spacing } from '../../theme';
import { getTodayCompletedOrders, getTodayRevenue, getTopSellers, getQueueCounts } from '../../utils/orderStats';
import StatsGrid from './StatsGrid';
import LiveQueue from './LiveQueue';
import TopSellers from './TopSellers';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

export default function HomeScreen({ navigation }: any) {
  const profile     = useVendorStore(state => state.profile);
  const setProfile  = useVendorStore(state => state.setProfile);
  const setSync     = useVendorStore(state => state.setSync);
  const activeOrders = useVendorStore(state => state.activeOrders);
  const pastOrders   = useVendorStore(state => state.pastOrders);

  const [refreshing, setRefreshing] = React.useState(false);

  const completedToday = useMemo(() => getTodayCompletedOrders(pastOrders), [pastOrders]);
  const revenue        = useMemo(() => getTodayRevenue(completedToday), [completedToday]);
  const topSellers     = useMemo(() => getTopSellers(pastOrders.filter(o => o.state.orderStatus === 'COMPLETED')), [pastOrders]);
  const queueCounts    = useMemo(() => getQueueCounts(activeOrders), [activeOrders]);

  const toggleOpen = useMutation({
    mutationFn: (isOpen: boolean) => api.vendor.updateProfile({ isOpen }),
    onSuccess: res => setProfile(res.data),
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const { data } = await api.vendor.sync();
      setSync(data);
    } finally {
      setRefreshing(false);
    }
  }, [setSync]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <View>
          <Text style={styles.greetingLine}>{greeting()}</Text>
          <Text style={styles.storeName}>{profile?.name ?? 'My Store'}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }>

        {/* Open/close toggle */}
        <View style={[styles.toggleCard, profile?.isOpen ? styles.toggleCardOpen : styles.toggleCardClosed]}>
          <View style={styles.toggleLeft}>
            <View style={[styles.statusDot, { backgroundColor: profile?.isOpen ? colors.success : colors.textSecondary }]} />
            <View>
              <Text style={styles.toggleStatus}>{profile?.isOpen ? 'Accepting orders' : 'Closed'}</Text>
              <Text style={styles.toggleSub}>{profile?.isOpen ? 'Tap to close your store' : 'Tap to start accepting'}</Text>
            </View>
          </View>
          <Switch
            value={profile?.isOpen ?? false}
            onValueChange={val => toggleOpen.mutate(val)}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor={colors.surface}
          />
        </View>

        {/* Stats */}
        <StatsGrid orderCount={completedToday.length} revenue={revenue} />

        {/* Live queue */}
        <LiveQueue
          counts={queueCounts}
          onViewAll={() => navigation.navigate('Orders')}
        />

        {/* Top sellers */}
        <TopSellers
          sellers={topSellers}
          onManageMenu={() => navigation.navigate('Menu')}
        />

      </ScrollView>
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
  greetingLine: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  storeName: { fontSize: 22, fontWeight: '800', color: colors.navy, marginTop: 2 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleCardOpen: { backgroundColor: '#F0FDF7', borderColor: '#BBF7D0' },
  toggleCardClosed: { backgroundColor: colors.surface, borderColor: colors.border },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  toggleStatus: { fontSize: 15, fontWeight: '700', color: colors.navy },
  toggleSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
