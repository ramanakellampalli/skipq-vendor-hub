import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import PasswordInput from '../../components/PasswordInput';
import LoadingDots from '../../components/LoadingDots';
import { api } from '../../api';
import { colors, radius, spacing } from '../../theme';

export default function ResetPasswordScreen({ route, navigation }: any) {
  const { email } = route.params as { email: string };
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP sent to your email');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await api.auth.resetPassword(email, otp.trim(), password);
      Alert.alert('Success', 'Your password has been reset. Please log in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>SQ</Text>
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the OTP sent to {email} and choose a new password
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>OTP</Text>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            placeholder="6-digit code"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Text style={styles.label}>New Password</Text>
          <PasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 8 characters"
          />

          <Text style={styles.label}>Confirm Password</Text>
          <PasswordInput
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Re-enter your password"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={loading}>
            {loading ? <LoadingDots /> : <Text style={styles.buttonText}>Reset Password</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: { gap: spacing.sm },
  label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backLink: { alignItems: 'center', paddingVertical: spacing.sm },
  backLinkText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
});
