import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Modal,
  FlatList,
} from 'react-native';
import { X, Plus, ChevronDown } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../api';
import { useVendorStore } from '../../store/vendorStore';

const CATEGORIES = ['Mains', 'Beverages', 'Snacks', 'Breakfast', 'Desserts', 'Rice', 'Breads', 'Sides'];
import { colors, radius, spacing } from '../../theme';

interface DraftVariant {
  label: string;
  price: string;
}

export default function AddMenuItemScreen({ navigation }: any) {
  const upsertMenuItem = useVendorStore(s => s.upsertMenuItem);

  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [isVeg, setIsVeg]             = useState(true);
  const [category, setCategory]       = useState('');
  const [basePrice, setBasePrice]     = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [variations, setVariations]   = useState<DraftVariant[]>([]);

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showVariantForm, setShowVariantForm]       = useState(false);
  const [variantLabel, setVariantLabel]             = useState('');
  const [variantPrice, setVariantPrice]             = useState('');

  const canSave = name.trim().length > 0 && basePrice.trim().length > 0 && !isNaN(parseFloat(basePrice));

  const save = useMutation({
    mutationFn: async () => {
      const extraVariants = variations.map((v, i) => ({
        label: v.label.trim() || undefined,
        price: parseFloat(v.price),
        displayOrder: i + 1,
      }));

      const itemRes = await api.menu.create({
        name: name.trim(),
        description: description.trim() || undefined,
        isVeg,
        category: category || undefined,
        displayOrder: 0,
        variants: [
          { price: parseFloat(basePrice), displayOrder: 0 },
          ...extraVariants,
        ],
      });
      const item = itemRes.data;

      if (!isAvailable) {
        const updated = await api.menu.update(item.id, { isAvailable: false });
        upsertMenuItem(updated.data);
      } else {
        upsertMenuItem(item);
      }
    },
    onSuccess: () => navigation.goBack(),
    onError: (err: any) => Alert.alert('Error', err.response?.data?.message || 'Failed to save item'),
  });

  const commitVariant = () => {
    if (!variantPrice.trim() || isNaN(parseFloat(variantPrice))) return;
    setVariations(vs => [...vs, { label: variantLabel.trim(), price: variantPrice.trim() }]);
    setVariantLabel('');
    setVariantPrice('');
    setShowVariantForm(false);
  };

  const removeVariant = (i: number) => setVariations(vs => vs.filter((_, j) => j !== i));

  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding">

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <X size={18} color={colors.navy} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>New menu item</Text>
          <Text style={styles.headerSub}>DRAFT</Text>
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, !canSave && styles.saveBtnOff]}
          onPress={() => save.mutate()}
          disabled={!canSave || save.isPending}
          activeOpacity={0.8}>
          <Text style={[styles.saveBtnText, !canSave && styles.saveBtnTextOff]}>
            {save.isPending ? 'Saving…' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">



        {/* ── Item name ── */}
        <View style={styles.field}>
          <Text style={styles.label}>ITEM NAME <Text style={styles.req}>*</Text></Text>
          <View style={styles.nameRow}>
            <TextInput
              style={[styles.input, styles.nameInput]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Paneer Tikka Roll"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
            <TouchableOpacity
              style={[styles.vegToggle, { backgroundColor: isVeg ? '#e8f5e9' : '#fce4ec' }]}
              onPress={() => setIsVeg(v => !v)}
              activeOpacity={0.8}>
              <View style={[styles.vegDot, { backgroundColor: isVeg ? colors.success : '#e53935' }]} />
              <Text style={[styles.vegText, { color: isVeg ? colors.success : '#e53935' }]}>
                {isVeg ? 'Veg' : 'Non-veg'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Category ── */}
        <View style={styles.field}>
          <Text style={styles.label}>CATEGORY</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowCategoryPicker(true)} activeOpacity={0.7}>
            <Text style={[styles.dropdownText, !category && styles.dropdownPlaceholder]}>
              {category || 'Choose category'}
            </Text>
            <ChevronDown size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Description ── */}
        <View style={styles.field}>
          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Short description shown to customers"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* ── Base price ── */}
        <View style={styles.field}>
          <Text style={styles.label}>BASE PRICE (₹) <Text style={styles.req}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={basePrice}
            onChangeText={setBasePrice}
            placeholder="₹0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>

        {/* ── Variations ── */}
        <View style={styles.field}>
          <Text style={styles.label}>VARIATIONS · <Text style={styles.optional}>OPTIONAL</Text></Text>
          <View style={styles.variationsBox}>
            {variations.length === 0 && !showVariantForm && (
              <Text style={styles.variationsHint}>Sizes, spice levels, add-ons</Text>
            )}
            {variations.map((v, i) => (
              <View key={i} style={styles.variantChip}>
                <Text style={styles.variantChipText}>
                  {v.label ? `${v.label} · ` : ''}₹{v.price}
                </Text>
                <TouchableOpacity onPress={() => removeVariant(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={13} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}

            {showVariantForm ? (
              <View style={styles.variantForm}>
                <TextInput
                  style={styles.variantInput}
                  value={variantLabel}
                  onChangeText={setVariantLabel}
                  placeholder="Label (e.g. Full, Half)"
                  placeholderTextColor={colors.textSecondary}
                  autoFocus
                />
                <TextInput
                  style={styles.variantInput}
                  value={variantPrice}
                  onChangeText={setVariantPrice}
                  placeholder="Price (₹)"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
                <View style={styles.variantFormRow}>
                  <TouchableOpacity onPress={() => { setShowVariantForm(false); setVariantLabel(''); setVariantPrice(''); }}>
                    <Text style={styles.variantCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.variantDoneBtn} onPress={commitVariant}>
                    <Text style={styles.variantDoneText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.addVariationBtn} onPress={() => setShowVariantForm(true)} activeOpacity={0.7}>
                <Plus size={14} color={colors.primary} />
                <Text style={styles.addVariationText}>Add variation</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Available toggle ── */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <Text style={styles.toggleTitle}>Available immediately</Text>
            <Text style={styles.toggleSub}>Item appears in customer menu after save</Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor={colors.surface}
          />
        </View>

      </ScrollView>

      {/* ── Category picker modal ── */}
      <Modal visible={showCategoryPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowCategoryPicker(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Choose category</Text>
            <FlatList
              data={CATEGORIES}
              keyExtractor={c => c}
              renderItem={({ item: cat }) => (
                <TouchableOpacity
                  style={[styles.pickerRow, category === cat && styles.pickerRowActive]}
                  onPress={() => { setCategory(cat); setShowCategoryPicker(false); }}
                  activeOpacity={0.7}>
                  <Text style={[styles.pickerRowText, category === cat && styles.pickerRowTextActive]}>
                    {cat}
                  </Text>
                  {category === cat && <View style={styles.pickerCheck} />}
                </TouchableOpacity>
              )}
              ListFooterComponent={
                category ? (
                  <TouchableOpacity style={styles.clearCategory} onPress={() => { setCategory(''); setShowCategoryPicker(false); }}>
                    <Text style={styles.clearCategoryText}>Clear selection</Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: 48 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle:  { fontSize: 16, fontWeight: '700', color: colors.navy },
  headerSub:    { fontSize: 11, color: colors.textSecondary, letterSpacing: 0.5, marginTop: 1 },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.navy,
  },
  saveBtnOff:      { backgroundColor: colors.border },
  saveBtnText:     { fontSize: 14, fontWeight: '700', color: '#fff' },
  saveBtnTextOff:  { color: colors.textSecondary },

  // Photo
  photoBox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: 6,
    backgroundColor: colors.surface,
  },
  photoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTitle: { fontSize: 15, fontWeight: '700', color: colors.navy },
  photoHint:  { fontSize: 12, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.lg },

  // Fields
  field: { gap: 6 },
  label: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.6 },
  req:   { color: colors.primary },
  optional: { fontWeight: '500', letterSpacing: 0.3 },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },

  // Name row with veg toggle
  nameRow:   { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  nameInput: { flex: 1 },
  vegToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  vegDot:  { width: 8, height: 8, borderRadius: 4 },
  vegText: { fontSize: 12, fontWeight: '700' },

  // Category dropdown
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  dropdownText:        { fontSize: 15, color: colors.textPrimary },
  dropdownPlaceholder: { color: colors.textSecondary },

  // Variations box
  variationsBox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  variationsHint: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  variantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  variantChipText: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },

  variantForm:    { gap: spacing.sm },
  variantInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  variantFormRow:    { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.sm },
  variantCancel:     { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  variantDoneBtn:    { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 7 },
  variantDoneText:   { fontSize: 13, fontWeight: '700', color: '#fff' },

  addVariationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: radius.sm,
  },
  addVariationText: { fontSize: 13, fontWeight: '700', color: colors.primary },

  // Available toggle
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  toggleLeft:  { flex: 1, marginRight: spacing.sm },
  toggleTitle: { fontSize: 15, fontWeight: '700', color: colors.navy },
  toggleSub:   { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  // Category picker
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '60%',
  },
  pickerTitle:   { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: spacing.md },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerRowActive:    { },
  pickerRowText:      { fontSize: 15, color: colors.textPrimary },
  pickerRowTextActive:{ color: colors.primary, fontWeight: '700' },
  pickerCheck: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary,
  },
  pickerEmpty:      { fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.lg },
  clearCategory:    { paddingVertical: 14, alignItems: 'center' },
  clearCategoryText:{ fontSize: 14, color: colors.textSecondary },
});
