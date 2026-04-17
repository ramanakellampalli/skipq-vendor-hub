import { useEffect, useRef } from 'react';
import Ably from 'ably';
import { useVendorStore } from '../store/vendorStore';
import { Order } from '../types';

const ABLY_KEY = 'cIil4A.5cbJuA:dOD-GiNhWEfBA0fTgIP6lSHAtWXzR9PdO2_OVnOBhdA';

export function useVendorSocket(vendorId: string | undefined) {
  const upsertOrder = useVendorStore(state => state.upsertOrder);
  const clientRef = useRef<Ably.Realtime | null>(null);

  useEffect(() => {
    if (!vendorId) return;

    const client = new Ably.Realtime({
      key: ABLY_KEY,
      closeOnUnload: false,
    });

    const channel = client.channels.get(`vendor:${vendorId}`);

    channel.subscribe('order', message => {
      const order: Order = JSON.parse(message.data);
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
