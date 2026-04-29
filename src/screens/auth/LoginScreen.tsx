import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import PasswordInput from '../../components/PasswordInput';
import LoadingDots from '../../components/LoadingDots';
import { api } from '../../api';
import { useAuthStore } from '../../store/authStore';
import {
  isBiometricAvailable,
  getBiometricLabel,
  promptBiometric,
  saveCredentials,
  getCredentials,
  hasSavedCredentials,
} from '../../utils/biometrics';
import { colors, radius, spacing } from '../../theme';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState<string | null>(null);
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const tryBiometricAutoPrompt = async () => {
      const available = await isBiometricAvailable();
      if (!available) return;

      const label = await getBiometricLabel();
      const hasCreds = await hasSavedCredentials();
      if (hasCreds) {
        setBiometricLabel(label);
        const success = await promptBiometric(`Sign in to SkipQ Vendor with ${label}`);
        if (success) {
          const creds = await getCredentials();
          if (creds) await doLogin(creds.email, creds.password);
        }
      }
    };
    tryBiometricAutoPrompt();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doLogin = async (loginEmail: string, loginPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data } = await api.auth.login(loginEmail.trim(), loginPassword);
      await setAuth(data.token, data.userId, data.name, data.email);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Network error';
      Alert.alert('Login Failed', msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }
    const success = await doLogin(email, password);
    if (!success) return;

    const available = await isBiometricAvailable();
    if (available) {
      const hasCreds = await hasSavedCredentials();
      if (!hasCreds) {
        const label = await getBiometricLabel();
        Alert.alert(
          'Enable Biometric Login',
          `Would you like to sign in with ${label} next time?`,
          [
            { text: 'Not Now', style: 'cancel' },
            {
              text: 'Enable',
              onPress: () => saveCredentials(email.trim(), password),
            },
          ],
        );
      }
    }
  };

  const handleBiometricLogin = async () => {
    const label = biometricLabel ?? 'Biometrics';
    const success = await promptBiometric(`Sign in to SkipQ Vendor with ${label}`);
    if (success) {
      const creds = await getCredentials();
      if (creds) {
        await doLogin(creds.email, creds.password);
      } else {
        setBiometricLabel(null);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>SQ</Text>
          </View>
          <Text style={styles.appName}>SkipQ Vendor</Text>
          <Text style={styles.tagline}>Manage your store on the go</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="vendor@example.com"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <PasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? <LoadingDots /> : <Text style={styles.buttonText}>Login</Text>}
          </TouchableOpacity>

          {biometricLabel && !loading && (
            <TouchableOpacity
              style={styles.biometricBtn}
              onPress={handleBiometricLogin}
              activeOpacity={0.8}>
              <Text style={styles.biometricText}>Sign in with {biometricLabel}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.setupLink}
            onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.setupLink}
            onPress={() => (navigation as any).navigate('SetupPassword')}>
            <Text style={styles.setupLinkText}>New vendor? Set up your account →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoContainer: { alignItems: 'center', marginBottom: spacing.xl },
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
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 4,
  },
  tagline: { fontSize: 14, color: colors.textSecondary },
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
  biometricBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  biometricText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  setupLink: { alignItems: 'center', paddingVertical: spacing.sm },
  setupLinkText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  forgotText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
});
