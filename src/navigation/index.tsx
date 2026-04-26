import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { ClipboardList, UtensilsCrossed, Store, History } from 'lucide-react-native';


import { useAuthStore } from '../store/authStore';
import { useVendorStore } from '../store/vendorStore';
import { useVendorSocket } from '../hooks/useVendorSocket';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { api } from '../api';
import { colors } from '../theme';

import LoginScreen from '../screens/auth/LoginScreen';
import SetupPasswordScreen from '../screens/auth/SetupPasswordScreen';
import SetupKYCScreen from '../screens/auth/SetupKYCScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import MenuScreen from '../screens/menu/MenuScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import NewSupportRequestScreen from '../screens/profile/NewSupportRequestScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import EarningsScreen from '../screens/history/EarningsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();
const HistoryStack = createStackNavigator();
const ProfileStack = createStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SetupPassword" component={SetupPasswordScreen} />
      <AuthStack.Screen name="SetupKYC" component={SetupKYCScreen} />
    </AuthStack.Navigator>
  );
}

function OrdersNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersList" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  );
}

function HistoryNavigator() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="HistoryList" component={HistoryScreen} />
      <HistoryStack.Screen name="Earnings" component={EarningsScreen} />
    </HistoryStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Support" component={SupportScreen} />
      <ProfileStack.Screen name="NewSupportRequest" component={NewSupportRequestScreen} />
    </ProfileStack.Navigator>
  );
}

function MainNavigator() {
  const pendingCount = useVendorStore(state =>
    state.activeOrders.filter(o => o.state.orderStatus === 'PENDING').length
  );
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarActiveBackgroundColor: 'transparent',
        tabBarButton: (props) => <TouchableOpacity {...props as any} activeOpacity={0.7} />,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 12 },
      }}>
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{
          tabBarIcon: ({ color }) => <ClipboardList size={22} color={color} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.error, fontSize: 11 },
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{ tabBarIcon: ({ color }) => <UtensilsCrossed size={22} color={color} /> }}
      />
      <Tab.Screen
        name="History"
        component={HistoryNavigator}
        options={{ tabBarIcon: ({ color }) => <History size={22} color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ tabBarIcon: ({ color }) => <Store size={22} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

const linking = {
  prefixes: ['skipq://'],
  config: { screens: { SetupPassword: 'vendor/setup' } },
};

export default function Navigation() {
  const { token, isLoading } = useAuthStore();
  const setSync = useVendorStore(state => state.setSync);
  const vendorId = useVendorStore(state => state.profile?.id);

  useEffect(() => {
    if (!token) return;
    api.vendor.sync().then(res => setSync(res.data)).catch(() => {});
  }, [token, setSync]);

  useVendorSocket(token ? vendorId : undefined);
  usePushNotifications(!!token);

  if (isLoading) return null;

  return (
    <NavigationContainer linking={linking}>
      {token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
