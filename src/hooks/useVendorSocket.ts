import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_WS_URL } from '../api/client';
import { useVendorStore } from '../store/vendorStore';
import { Order } from '../types';

export function useVendorSocket(vendorId: string | undefined) {
  const upsertOrder = useVendorStore(state => state.upsertOrder);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!vendorId) return;

    let active = true;

    const connect = async () => {
      const token = await AsyncStorage.getItem('jwt');
      if (!token || !active) return;

      const stompClient = new Client({
        brokerURL: BASE_WS_URL,
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        onConnect: () => {
          stompClient.subscribe(`/topic/vendor/${vendorId}`, message => {
            const order: Order = JSON.parse(message.body);
            upsertOrder(order);
          });
        },
      });

      stompClient.activate();
      clientRef.current = stompClient;
    };

    connect();

    return () => {
      active = false;
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [vendorId, upsertOrder]);
}
