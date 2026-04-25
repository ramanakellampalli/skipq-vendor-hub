import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Download } from 'lucide-react-native';
import { Order, VendorProfile } from '../types';
import { buildOrderInvoiceHtml } from '../utils/invoiceHtml';
import { generateAndSharePdf } from '../utils/pdfExport';
import { colors, radius, spacing } from '../theme';

interface Props {
  order: Order;
  profile: VendorProfile;
}

export default function DownloadInvoiceButton({ order, profile }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      const html = buildOrderInvoiceHtml(order, profile);
      await generateAndSharePdf(html, `invoice-${order.id.slice(0, 8).toUpperCase()}`);
    } catch {
      Alert.alert('Export Failed', 'Could not generate the invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.8}>
      {loading
        ? <ActivityIndicator color={colors.primary} size="small" />
        : <>
            <Download size={16} color={colors.primary} />
            <Text style={styles.text}>Download Invoice</Text>
          </>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    backgroundColor: '#FFF7ED',
  },
  text: { fontSize: 15, fontWeight: '600', color: colors.primary },
});
