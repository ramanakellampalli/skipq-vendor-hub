import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { BASE_WS_URL } from '../api/client';

export function useVendorSocket(vendorId: string | undefined) {
  const queryClient = useQueryClient();
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
          stompClient.subscribe(`/topic/vendor/${vendorId}`, () => {
            queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
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
  }, [vendorId, queryClient]);
}
