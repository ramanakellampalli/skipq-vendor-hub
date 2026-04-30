import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './src/navigation';
import { useAuthStore } from './src/store/authStore';
import { useVendorStore } from './src/store/vendorStore';
import { api } from './src/api';

const queryClient = new QueryClient();

function AppContent() {
  const { loadFromStorage, token } = useAuthStore();
  const { setSync, reset } = useVendorStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!token) {
      reset();
      return;
    }
    api.vendor.sync().then(res => setSync(res.data)).catch(() => setSync({ profile: null as any, activeOrders: [], pastOrders: [], categories: [], uncategorized: [], serviceRequests: [] }));
  }, [token, reset, setSync]);

  return <Navigation />;
}

const rootStyle = { flex: 1 };

export default function App() {
  return (
    <GestureHandlerRootView style={rootStyle}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
          <AppContent />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
