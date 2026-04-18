import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { api } from '../../api';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing } from '../../theme';

export default function SetupKYCScreen({ route, navigation }: any) {
  const { token, password } = route.params;
  const { setAuth } = useAuthStore();

  const [businessName, setBusinessName] = useState('');
  const [pan, setPan] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [gstRegistered, setGstRegistered] = useState(false);
  const [gstin, setGstin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!businessName.trim()) {
      Alert.alert('Error', 'Business name is required');
      return;
    }
    if (!pan.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase())) {
      Alert.alert('Error', 'Enter a valid PAN (e.g. ABCDE1234F)');
      return;
    }
    if (!bankAccount.trim()) {
      Alert.alert('Error', 'Bank account number is required');
      return;
    }
    if (!ifsc.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())) {
      Alert.alert('Error', 'Enter a valid IFSC code (e.g. SBIN0001234)');
      return;
    }
    if (gstRegistered && (!gstin.trim() || gstin.trim().length !== 15)) {
      Alert.alert('Error', 'Enter a valid 15-digit GSTIN');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.auth.setupAccount({
        token,
        newPassword: password,
        businessName: businessName.trim(),
        pan: pan.toUpperCase().trim(),
        bankAccount: bankAccount.trim(),
        ifsc: ifsc.toUpperCase().trim(),
        gstRegistered,
        gstin: gstRegistered ? gstin.toUpperCase().trim() : undefined,
      });
      await setAuth(data.token, data.userId, data.name, data.email);
    } catch (err: any) {
      Alert.alert('Setup Failed', err.response?.data?.message || 'Something went wrong. Please try again.');
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
          <Text style={styles.title}>Business Details</Text>
          <Text style={styles.subtitle}>
            This information is used for payouts and tax purposes
          </Text>
          <View style={styles.stepRow}>
            <View style={styles.step} />
            <View style={[styles.step, styles.stepActive]} />
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Business Name</Text>
          <TextInput
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="e.g. Ramana's Canteen"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
          />

          <Text style={styles.label}>PAN Number</Text>
          <TextInput
            style={styles.input}
            value={pan}
            onChangeText={t => setPan(t.toUpperCase())}
            placeholder="e.g. ABCDE1234F"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
            maxLength={10}
          />

          <Text style={styles.label}>Bank Account Number</Text>
          <TextInput
            style={styles.input}
            value={bankAccount}
            onChangeText={setBankAccount}
            placeholder="Enter account number"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>IFSC Code</Text>
          <TextInput
            style={styles.input}
            value={ifsc}
            onChangeText={t => setIfsc(t.toUpperCase())}
            placeholder="e.g. SBIN0001234"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
            maxLength={11}
          />

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.label}>GST Registered?</Text>
              <Text style={styles.toggleHint}>Toggle on if you have a GSTIN</Text>
            </View>
            <Switch
              value={gstRegistered}
              onValueChange={setGstRegistered}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          {gstRegistered && (
            <>
              <Text style={styles.label}>GSTIN</Text>
              <TextInput
                style={styles.input}
                value={gstin}
                onChangeText={t => setGstin(t.toUpperCase())}
                placeholder="e.g. 29ABCDE1234F1Z5"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
                maxLength={15}
              />
              <Text style={styles.gstNote}>
                Customers in your orders will see CGST 2.5% + SGST 2.5% on their receipt
              </Text>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Complete Setup</Text>
            )}
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
  title: { fontSize: 24, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  stepRow: { flexDirection: 'row', gap: 8, marginTop: spacing.sm },
  step: { width: 32, height: 4, borderRadius: 2, backgroundColor: colors.border },
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  toggleHint: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  gstNote: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: -4,
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
