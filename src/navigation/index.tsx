import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Home, ClipboardList, UtensilsCrossed, Store } from 'lucide-react-native';


import { useAuthStore } from '../store/authStore';
import { useVendorStore } from '../store/vendorStore';
import { useVendorSocket } from '../hooks/useVendorSocket';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { api } from '../api';
import { colors } from '../theme';
import OrderAlertPlayer from '../components/OrderAlertPlayer';

import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import SetupPasswordScreen from '../screens/auth/SetupPasswordScreen';
import SetupKYCScreen from '../screens/auth/SetupKYCScreen';
import HomeScreen from '../screens/home/HomeScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import MenuScreen from '../screens/menu/MenuScreen';
import AddMenuItemScreen from '../screens/menu/AddMenuItemScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import NewSupportRequestScreen from '../screens/profile/NewSupportRequestScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import EarningsScreen from '../screens/history/EarningsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

const TabBarButton = (props: any) => <TouchableOpacity {...props} activeOpacity={0.7} />;
const IconHome    = ({ color }: { color: string }) => <Home size={22} color={color} />;
const IconOrders  = ({ color }: { color: string }) => <ClipboardList size={22} color={color} />;
const IconMenu    = ({ color }: { color: string }) => <UtensilsCrossed size={22} color={color} />;
const IconProfile = ({ color }: { color: string }) => <Store size={22} color={color} />;
const HomeStack     = createStackNavigator();
const ProfileStack  = createStackNavigator();
const MenuStack     = createStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <AuthStack.Screen name="SetupPassword" component={SetupPasswordScreen} />
      <AuthStack.Screen name="SetupKYC" component={SetupKYCScreen} />
    </AuthStack.Navigator>
  );
}

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    </HomeStack.Navigator>
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

function MenuNavigator() {
  return (
    <MenuStack.Navigator screenOptions={{ headerShown: false }}>
      <MenuStack.Screen name="MenuMain" component={MenuScreen} />
      <MenuStack.Screen name="AddMenuItem" component={AddMenuItemScreen} />
    </MenuStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="History" component={HistoryScreen} />
      <ProfileStack.Screen name="Earnings" component={EarningsScreen} />
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
        tabBarButton: TabBarButton,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 12 },
      }}>
      <Tab.Screen name="Home" component={HomeNavigator} options={{ tabBarIcon: IconHome }} />
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{
          tabBarIcon: IconOrders,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.error, fontSize: 11 },
        }}
      />
      <Tab.Screen name="Menu" component={MenuNavigator} options={{ tabBarIcon: IconMenu }} />
      <Tab.Screen name="Profile" component={ProfileNavigator} options={{ tabBarIcon: IconProfile }} />
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
      {token ? (
        <>
          <MainNavigator />
          <OrderAlertPlayer />
        </>
      ) : <AuthNavigator />}
    </NavigationContainer>
  );
}
