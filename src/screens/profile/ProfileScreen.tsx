import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react-native';
import { api } from '../../api';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing } from '../../theme';

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const { logout, name, email } = useAuthStore();
  const [prepTime, setPrepTime] = useState('');
  const [editingPrepTime, setEditingPrepTime] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.vendor.getProfile().then(r => r.data),
    onSuccess: (data: any) => {
      setPrepTime(data.prepTime.toString());
    },
  });

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.vendor.updateProfile(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
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

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Store Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Store</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Name</Text>
          <Text style={styles.rowValue}>{profile?.name}</Text>
        </View>
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

      {/* Account Info */}
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

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={18} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
    margin: spacing.md,
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
});
