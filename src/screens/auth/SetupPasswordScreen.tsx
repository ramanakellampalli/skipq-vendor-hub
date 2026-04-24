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
  Linking,
  ScrollView,
} from 'react-native';
import PasswordInput from '../../components/PasswordInput';
import LoadingDots from '../../components/LoadingDots';
import { colors, radius, spacing } from '../../theme';

export default function SetupPasswordScreen({ route, navigation }: any) {
  const [token, setToken] = useState(route?.params?.token || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      const match = url.match(/token=([^&]+)/);
      if (match) setToken(match[1]);
    };
    const sub = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then(url => {
      if (url) handleUrl({ url });
    });
    return () => sub.remove();
  }, []);

  const handleNext = () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter your setup token');
      return;
    }
    if (!password || password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    navigation.navigate('SetupKYC', { token: token.trim(), password });
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
          <Text style={styles.title}>Set Up Your Account</Text>
          <Text style={styles.subtitle}>
            Enter the token from your invite email and choose a password
          </Text>
          <View style={styles.stepRow}>
            <View style={[styles.step, styles.stepActive]} />
            <View style={styles.step} />
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Setup Token</Text>
          <TextInput
            style={styles.input}
            value={token}
            onChangeText={setToken}
            placeholder="Paste your token here"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
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
            onPress={handleNext}
            disabled={loading}>
            {loading ? <LoadingDots /> : <Text style={styles.buttonText}>Next →</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>← Back to Login</Text>
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
    marginBottom: spacing.md,
  },
  stepRow: { flexDirection: 'row', gap: 8, marginTop: spacing.sm },
  step: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  stepActive: { backgroundColor: colors.primary },
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
