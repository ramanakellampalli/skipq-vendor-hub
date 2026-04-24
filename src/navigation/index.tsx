import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { ClipboardList, UtensilsCrossed, Store, History } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '../store/authStore';
import { useVendorStore } from '../store/vendorStore';
import { useVendorSocket } from '../hooks/useVendorSocket';
import { api } from '../api';
import { colors } from '../theme';

import LoginScreen from '../screens/auth/LoginScreen';
import SetupPasswordScreen from '../screens/auth/SetupPasswordScreen';
import SetupKYCScreen from '../screens/auth/SetupKYCScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import MenuScreen from '../screens/menu/MenuScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import HistoryScreen from '../screens/history/HistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SetupPassword" component={SetupPasswordScreen} />
      <AuthStack.Screen name="SetupKYC" component={SetupKYCScreen} />
    </AuthStack.Navigator>
  );
}

function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersList" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  );
}

function MainNavigator() {
  const insets = useSafeAreaInsets();
  const pendingCount = useVendorStore(state =>
    state.activeOrders.filter(o => o.state.orderStatus === 'PENDING').length
  );
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 12 },
      }}>
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={{
          tabBarIcon: ({ color }) => <ClipboardList size={22} color={color} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.error, fontSize: 11 },
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarIcon: ({ color }) => <UtensilsCrossed size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color }) => <History size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Store size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const linking = {
  prefixes: ['skipq://'],
  config: {
    screens: {
      SetupPassword: 'vendor/setup',
    },
  },
};

export default function Navigation() {
  const { token, isLoading } = useAuthStore();
  const setSync = useVendorStore(state => state.setSync);
  const vendorId = useVendorStore(state => state.profile?.id);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!token) return;
    api.vendor.sync().then(res => setSync(res.data)).catch(() => {});
  }, [token, setSync]);

  useEffect(() => {
    if (!token) return;
    const sub = AppState.addEventListener('change', next => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        api.vendor.sync().then(res => setSync(res.data)).catch(() => {});
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [token, setSync]);

  useVendorSocket(token ? vendorId : undefined);

  if (isLoading) return null;

  return (
    <NavigationContainer linking={linking}>
      {token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
