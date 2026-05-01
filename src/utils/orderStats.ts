import { Order, OrderItem } from '../types';

const isToday = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
};

export function getTodayCompletedOrders(pastOrders: Order[]): Order[] {
  return pastOrders.filter(
    o => o.state.orderStatus === 'COMPLETED' && isToday(o.timeline.createdAt),
  );
}

export function getTodayRevenue(completedToday: Order[]): number {
  return completedToday.reduce((sum, o) => sum + o.pricing.totalAmount, 0);
}

export interface TopSeller {
  menuItemId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export function getTopSellers(completedToday: Order[], limit = 5): TopSeller[] {
  const map = new Map<string, TopSeller>();

  completedToday.forEach(order => {
    order.items.forEach((item: OrderItem) => {
      const existing = map.get(item.menuItemId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
      } else {
        map.set(item.menuItemId, {
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          revenue: item.subtotal,
        });
      }
    });
  });

  return Array.from(map.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export interface QueueCounts {
  pending: number;
  accepted: number;
  preparing: number;
  ready: number;
  total: number;
}

export function getQueueCounts(activeOrders: Order[]): QueueCounts {
  const counts = { pending: 0, accepted: 0, preparing: 0, ready: 0 };
  activeOrders.forEach(o => {
    if (o.state.orderStatus === 'PENDING')   counts.pending++;
    if (o.state.orderStatus === 'ACCEPTED')  counts.accepted++;
    if (o.state.orderStatus === 'PREPARING') counts.preparing++;
    if (o.state.orderStatus === 'READY')     counts.ready++;
  });
  return { ...counts, total: activeOrders.length };
}
