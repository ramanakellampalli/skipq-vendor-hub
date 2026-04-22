import { useEffect, useRef } from 'react';
import { Vibration } from 'react-native';
import Ably from 'ably';
import Config from 'react-native-config';
import { useVendorStore } from '../store/vendorStore';
import { Order } from '../types';
const NEW_ORDER_PATTERN = [0, 300, 150, 300];

export function useVendorSocket(vendorId: string | undefined) {
  const upsertOrder = useVendorStore(state => state.upsertOrder);
  const clientRef = useRef<Ably.Realtime | null>(null);
  const activeOrdersRef = useRef(useVendorStore.getState().activeOrders);

  useEffect(() => {
    return useVendorStore.subscribe(state => {
      activeOrdersRef.current = state.activeOrders;
    });
  }, []);

  useEffect(() => {
    if (!vendorId) return;

    if (!Config.ABLY_API_KEY) return;
    const client = new Ably.Realtime({ key: Config.ABLY_API_KEY, closeOnUnload: false });
    const channel = client.channels.get(`vendor:${vendorId}`);

    channel.subscribe('order', message => {
      const order: Order = JSON.parse(message.data);
      const isNew = !activeOrdersRef.current.some(o => o.id === order.id);
      if (isNew && order.state.orderStatus === 'PENDING') {
        Vibration.vibrate(NEW_ORDER_PATTERN);
      }
      upsertOrder(order);
    });

    clientRef.current = client;

    return () => {
      channel.unsubscribe();
      client.close();
      clientRef.current = null;
    };
  }, [vendorId, upsertOrder]);
}
