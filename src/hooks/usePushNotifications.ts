import { useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import {
  getMessaging,
  requestPermission,
  hasPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }

  const status = await requestPermission(getMessaging());
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  );
}

export async function getNotificationStatus(): Promise<number> {
  return hasPermission(getMessaging());
}

export function usePushNotifications(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    requestNotificationPermission();
  }, [enabled]);
}
