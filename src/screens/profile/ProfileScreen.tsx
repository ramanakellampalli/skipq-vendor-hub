import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthorizationStatus } from '@react-native-firebase/messaging';
import { useMutation } from '@tanstack/react-query';
import { LogOut, Trash2, Bell, BellOff, ChevronRight } from 'lucide-react-native';
import { api } from '../../api';
import { useAuthStore } from '../../store/authStore';
import { useVendorStore } from '../../store/vendorStore';
import { hasSavedCredentials } from '../../utils/biometrics';
import { requestNotificationPermission, getNotificationStatus } from '../../hooks/usePushNotifications';
import { colors, radius, spacing } from '../../theme';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { logout, name, email } = useAuthStore();
  const profile = useVendorStore(state => state.profile);
  const setProfile = useVendorStore(state => state.setProfile);

  const [prepTime, setPrepTime] = useState('');
  const [editingPrepTime, setEditingPrepTime] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notifStatus, setNotifStatus] = useState<number>(AuthorizationStatus.NOT_DETERMINED);

  useEffect(() => {
    getNotificationStatus().then(setNotifStatus);
  }, []);

  useEffect(() => {
    if (profile?.prepTime != null) {
      setPrepTime(profile.prepTime.toString());
    }
  }, [profile?.prepTime]);

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.vendor.updateProfile(data),
    onSuccess: res => setProfile(res.data),
  });

  const handlePrepTimeSave = () => {
    const val = parseInt(prepTime);
    if (isNaN(val) || val < 1) {
      Alert.alert('Error', 'Please enter a valid prep time');
      return;
    }
    updateProfile.mutate({ prepTime: val });
    setEditingPrepTime(false);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your vendor account, menu, and all order history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await api.vendor.deleteAccount();
              await logout();
            } catch {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleEnableNotifications = async () => {
    if (notifStatus === AuthorizationStatus.AUTHORIZED) return;
    if (notifStatus === AuthorizationStatus.DENIED) {
      Linking.openSettings();
      return;
    }
    const granted = await requestNotificationPermission();
    const status = await getNotificationStatus();
    setNotifStatus(status);
    if (!granted) {
      Alert.alert('Notifications blocked', 'Please enable notifications in your device settings.');
    }
  };

  const handleLogout = async () => {
    const hasBiometrics = await hasSavedCredentials();
    const message = hasBiometrics
      ? 'You will be logged out. Use your fingerprint to sign back in quickly.'
      : 'Are you sure you want to logout?';

    Alert.alert('Logout', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Store</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Name</Text>
          <Text style={styles.rowValue}>{profile?.name}</Text>
        </View>
        {profile?.campusName && (
          <>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Campus</Text>
              <Text style={styles.rowValue}>{profile.campusName}</Text>
            </View>
          </>
        )}
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Status</Text>
          <View style={styles.rowRight}>
            <Text style={[styles.statusText, { color: profile?.isOpen ? colors.success : colors.textSecondary }]}>
              {profile?.isOpen ? 'Open' : 'Closed'}
            </Text>
            <Switch
              value={profile?.isOpen ?? false}
              onValueChange={val => updateProfile.mutate({ isOpen: val })}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={colors.surface}
            />
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Prep Time</Text>
          {editingPrepTime ? (
            <View style={styles.prepTimeEdit}>
              <TextInput
                style={styles.prepTimeInput}
                value={prepTime}
                onChangeText={setPrepTime}
                keyboardType="number-pad"
                autoFocus
              />
              <Text style={styles.rowValue}> min</Text>
              <TouchableOpacity onPress={handlePrepTimeSave} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditingPrepTime(true)}>
              <Text style={[styles.rowValue, { color: colors.primary }]}>
                {profile?.prepTime} min ✎
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Name</Text>
          <Text style={styles.rowValue}>{name}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Email</Text>
          <Text style={styles.rowValue}>{email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <TouchableOpacity style={styles.row} onPress={handleEnableNotifications} activeOpacity={0.7}>
          <View style={styles.notifLeft}>
            {notifStatus === AuthorizationStatus.AUTHORIZED
              ? <Bell size={16} color={colors.primary} />
              : <BellOff size={16} color={colors.textSecondary} />}
            <Text style={styles.rowLabel}>Order Alerts</Text>
          </View>
          <Text style={styles.rowValue}>
            {notifStatus === AuthorizationStatus.AUTHORIZED
              ? 'Enabled'
              : notifStatus === AuthorizationStatus.DENIED
                ? 'Blocked — tap to open settings'
                : 'Tap to enable'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business & Payouts</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>KYC Status</Text>
          <View style={[styles.badge, profile?.kycApproved ? styles.badgeSuccess : styles.badgePending]}>
            <Text style={[styles.badgeText, profile?.kycApproved ? styles.badgeSuccessText : styles.badgePendingText]}>
              {profile?.kycApproved ? 'Verified' : 'Pending'}
            </Text>
          </View>
        </View>
        {!profile?.kycApproved && (
          <>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.kycNote}>
                Your payouts are on hold until Razorpay verifies your KYC. This usually takes 24–48 hours.
              </Text>
            </View>
          </>
        )}
        {profile?.businessName && (
          <>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Business Name</Text>
              <Text style={styles.rowValue}>{profile.businessName}</Text>
            </View>
          </>
        )}
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>GST Registered</Text>
          <Text style={styles.rowValue}>{profile?.gstRegistered ? 'Yes' : 'No'}</Text>
        </View>
        {profile?.gstRegistered && profile?.gstin && (
          <>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>GSTIN</Text>
              <Text style={styles.rowValue}>{profile.gstin}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help</Text>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Support')} activeOpacity={0.7}>
          <Text style={styles.rowLabel}>Contact Support</Text>
          <ChevronRight size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={18} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} disabled={isDeleting}>
        <Trash2 size={16} color={colors.textSecondary} />
        <Text style={styles.deleteText}>{isDeleting ? 'Deleting…' : 'Delete Account'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.navy },
  section: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowLabel: { fontSize: 15, color: colors.textPrimary },
  rowValue: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  statusText: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md },
  prepTimeEdit: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  prepTimeInput: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 15,
    color: colors.textPrimary,
    width: 56,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.error },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  deleteText: { fontSize: 13, color: colors.textSecondary },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeSuccess: { backgroundColor: '#e6f4ea' },
  badgePending: { backgroundColor: '#fff3e0' },
  badgeText: { fontSize: 13, fontWeight: '700' },
  badgeSuccessText: { color: colors.success },
  badgePendingText: { color: '#f57c00' },
  notifLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  kycNote: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
});
