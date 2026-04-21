import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Leaf } from 'lucide-react-native';
import { api } from '../../api';
import { colors, radius, spacing } from '../../theme';
import { MenuItem, MenuCategory, MenuVariant } from '../../types';
import { useVendorStore } from '../../store/vendorStore';

// ─── Item modal ──────────────────────────────────────────────────────────────

interface ItemModalProps {
  visible: boolean;
  editing: MenuItem | null;
  categories: MenuCategory[];
  onClose: () => void;
  onSaved: (item: MenuItem) => void;
}

function ItemModal({ visible, editing, categories, onClose, onSaved }: ItemModalProps) {
  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [isVeg, setIsVeg] = useState(editing?.isVeg ?? true);
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? '');

  React.useEffect(() => {
    setName(editing?.name ?? '');
    setDescription(editing?.description ?? '');
    setIsVeg(editing?.isVeg ?? true);
    setCategoryId(editing?.categoryId ?? '');
  }, [editing, visible]);

  const createItem = useMutation({
    mutationFn: () =>
      api.menu.create({ name, description: description || undefined, isVeg, categoryId: categoryId || undefined }),
    onSuccess: res => { onSaved(res.data); onClose(); },
  });

  const updateItem = useMutation({
    mutationFn: () =>
      api.menu.update(editing!.id, { name, description: description || undefined, isVeg, categoryId: categoryId || undefined }),
    onSuccess: res => { onSaved(res.data); onClose(); },
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Item name is required');
      return;
    }
    editing ? updateItem.mutate() : createItem.mutate();
  };

  const busy = createItem.isPending || updateItem.isPending;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editing ? 'Edit Item' : 'Add Menu Item'}</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Chicken Biryani"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Short description..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={2}
          />

          <View style={styles.row}>
            <Text style={styles.label}>Vegetarian</Text>
            <Switch
              value={isVeg}
              onValueChange={setIsVeg}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={colors.surface}
            />
          </View>

          {categories.length > 0 && (
            <>
              <Text style={styles.label}>Category (optional)</Text>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, !categoryId && styles.chipActive]}
                  onPress={() => setCategoryId('')}>
                  <Text style={[styles.chipText, !categoryId && styles.chipTextActive]}>None</Text>
                </TouchableOpacity>
                {categories.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, categoryId === c.id && styles.chipActive]}
                    onPress={() => setCategoryId(c.id)}>
                    <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, busy && { opacity: 0.6 }]} onPress={handleSave} disabled={busy}>
              <Text style={styles.saveText}>{editing ? 'Save' : 'Add Item'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Variant modal ────────────────────────────────────────────────────────────

interface VariantModalProps {
  visible: boolean;
  itemId: string;
  editing: MenuVariant | null;
  onClose: () => void;
  onSaved: (v: MenuVariant) => void;
}

function VariantModal({ visible, itemId, editing, onClose, onSaved }: VariantModalProps) {
  const [label, setLabel] = useState(editing?.label ?? '');
  const [price, setPrice] = useState(editing ? editing.price.toString() : '');

  React.useEffect(() => {
    setLabel(editing?.label ?? '');
    setPrice(editing ? editing.price.toString() : '');
  }, [editing, visible]);

  const addVariant = useMutation({
    mutationFn: () =>
      api.variants.add(itemId, { label: label || undefined, price: parseFloat(price) }),
    onSuccess: res => { onSaved(res.data); onClose(); },
  });

  const updateVariant = useMutation({
    mutationFn: () =>
      api.variants.update(itemId, editing!.id, { label: label || undefined, price: parseFloat(price) }),
    onSuccess: res => { onSaved(res.data); onClose(); },
  });

  const handleSave = () => {
    if (!price || isNaN(parseFloat(price))) {
      Alert.alert('Error', 'Enter a valid price');
      return;
    }
    editing ? updateVariant.mutate() : addVariant.mutate();
  };

  const busy = addVariant.isPending || updateVariant.isPending;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editing ? 'Edit Variant' : 'Add Variant'}</Text>

          <Text style={styles.label}>Label (optional)</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Regular, Medium, Full"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Price (₹)</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, busy && { opacity: 0.6 }]} onPress={handleSave} disabled={busy}>
              <Text style={styles.saveText}>{editing ? 'Save' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Category modal ───────────────────────────────────────────────────────────

interface CategoryModalProps {
  visible: boolean;
  editing: MenuCategory | null;
  onClose: () => void;
  onSaved: (c: MenuCategory) => void;
}

function CategoryModal({ visible, editing, onClose, onSaved }: CategoryModalProps) {
  const [name, setName] = useState(editing?.name ?? '');

  React.useEffect(() => {
    setName(editing?.name ?? '');
  }, [editing, visible]);

  const createCat = useMutation({
    mutationFn: () => api.categories.create({ name }),
    onSuccess: res => { onSaved(res.data); onClose(); },
  });

  const updateCat = useMutation({
    mutationFn: () => api.categories.update(editing!.id, { name }),
    onSuccess: res => { onSaved(res.data); onClose(); },
  });

  const handleSave = () => {
    if (!name.trim()) return;
    editing ? updateCat.mutate() : createCat.mutate();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editing ? 'Edit Category' : 'Add Category'}</Text>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Starters, Mains, Beverages"
            placeholderTextColor={colors.textSecondary}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>{editing ? 'Save' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── MenuItem card ────────────────────────────────────────────────────────────

interface ItemCardProps {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onAddVariant: () => void;
  onEditVariant: (v: MenuVariant) => void;
  onDeleteVariant: (v: MenuVariant) => void;
  onToggleAvailable: (val: boolean) => void;
  onToggleVariantAvailable: (v: MenuVariant, val: boolean) => void;
}

function ItemCard({
  item,
  onEdit,
  onDelete,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
  onToggleAvailable,
  onToggleVariantAvailable,
}: ItemCardProps) {
  const priceRange = () => {
    if (!item.variants.length) return '—';
    const prices = item.variants.map(v => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `₹${min.toFixed(2)}` : `₹${min.toFixed(2)} – ₹${max.toFixed(2)}`;
  };

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemLeft}>
          <View style={[styles.vegDot, { backgroundColor: item.isVeg ? colors.success : '#e53935' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
            ) : null}
            <Text style={styles.itemPrice}>{priceRange()}</Text>
          </View>
        </View>
        <View style={styles.itemActions}>
          <Switch
            value={item.isAvailable}
            onValueChange={onToggleAvailable}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor={colors.surface}
          />
          <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
            <Pencil size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
            <Trash2 size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.variantRow}>
        {item.variants.map(v => (
          <View key={v.id} style={[styles.variantPill, !v.isAvailable && styles.variantPillOff]}>
            <TouchableOpacity onPress={() => onToggleVariantAvailable(v, !v.isAvailable)}>
              <Text style={[styles.variantLabel, !v.isAvailable && styles.variantLabelOff]}>
                {v.label ? `${v.label} · ` : ''}₹{v.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onEditVariant(v)} style={{ paddingLeft: 4 }}>
              <Pencil size={12} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDeleteVariant(v)} style={{ paddingLeft: 2 }}>
              <Trash2 size={12} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addVariantBtn} onPress={onAddVariant}>
          <Plus size={12} color={colors.primary} />
          <Text style={styles.addVariantText}>variant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Category section ─────────────────────────────────────────────────────────

interface CategorySectionProps {
  category: MenuCategory;
  onEditCategory: () => void;
  onDeleteCategory: () => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (item: MenuItem) => void;
  onAddVariant: (item: MenuItem) => void;
  onEditVariant: (item: MenuItem, v: MenuVariant) => void;
  onDeleteVariant: (item: MenuItem, v: MenuVariant) => void;
  onToggleItemAvailable: (item: MenuItem, val: boolean) => void;
  onToggleVariantAvailable: (item: MenuItem, v: MenuVariant, val: boolean) => void;
}

function CategorySection({
  category,
  onEditCategory,
  onDeleteCategory,
  onEditItem,
  onDeleteItem,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
  onToggleItemAvailable,
  onToggleVariantAvailable,
}: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <TouchableOpacity style={styles.sectionHeaderLeft} onPress={() => setCollapsed(v => !v)}>
          {collapsed
            ? <ChevronRight size={16} color={colors.textSecondary} />
            : <ChevronDown size={16} color={colors.textSecondary} />}
          <Text style={styles.sectionTitle}>{category.name}</Text>
          <Text style={styles.sectionCount}>{category.items.length}</Text>
        </TouchableOpacity>
        <View style={styles.sectionActions}>
          <TouchableOpacity onPress={onEditCategory} style={styles.iconBtn}>
            <Pencil size={14} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDeleteCategory} style={styles.iconBtn}>
            <Trash2 size={14} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {!collapsed && category.items.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          onEdit={() => onEditItem(item)}
          onDelete={() => onDeleteItem(item)}
          onAddVariant={() => onAddVariant(item)}
          onEditVariant={v => onEditVariant(item, v)}
          onDeleteVariant={v => onDeleteVariant(item, v)}
          onToggleAvailable={val => onToggleItemAvailable(item, val)}
          onToggleVariantAvailable={(v, val) => onToggleVariantAvailable(item, v, val)}
        />
      ))}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MenuScreen() {
  const categories = useVendorStore(s => s.categories);
  const uncategorized = useVendorStore(s => s.uncategorized);
  const upsertCategory = useVendorStore(s => s.upsertCategory);
  const removeCategory = useVendorStore(s => s.removeCategory);
  const upsertMenuItem = useVendorStore(s => s.upsertMenuItem);
  const removeMenuItem = useVendorStore(s => s.removeMenuItem);
  const upsertVariant = useVendorStore(s => s.upsertVariant);
  const removeVariant = useVendorStore(s => s.removeVariant);

  const [itemModal, setItemModal] = useState<{ visible: boolean; editing: MenuItem | null }>({ visible: false, editing: null });
  const [variantModal, setVariantModal] = useState<{ visible: boolean; itemId: string; editing: MenuVariant | null }>({ visible: false, itemId: '', editing: null });
  const [categoryModal, setCategoryModal] = useState<{ visible: boolean; editing: MenuCategory | null }>({ visible: false, editing: null });

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0) + uncategorized.length;

  const updateItemAvailability = useMutation({
    mutationFn: ({ id, val }: { id: string; val: boolean }) => api.menu.update(id, { isAvailable: val }),
    onSuccess: res => upsertMenuItem(res.data),
  });

  const updateVariantAvailability = useMutation({
    mutationFn: ({ itemId, variantId, val }: { itemId: string; variantId: string; val: boolean }) =>
      api.variants.update(itemId, variantId, { isAvailable: val }),
    onSuccess: (res, vars) => upsertVariant(vars.itemId, res.data),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => api.menu.delete(id),
    onSuccess: (_, id) => removeMenuItem(id),
  });

  const deleteVariantMutation = useMutation({
    mutationFn: ({ itemId, variantId }: { itemId: string; variantId: string }) =>
      api.variants.delete(itemId, variantId),
    onSuccess: (_, vars) => removeVariant(vars.itemId, vars.variantId),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => api.categories.delete(id),
    onSuccess: (_, id) => removeCategory(id),
  });

  const confirmDeleteItem = (item: MenuItem) => {
    Alert.alert('Delete Item', `Remove "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItemMutation.mutate(item.id) },
    ]);
  };

  const confirmDeleteVariant = (item: MenuItem, v: MenuVariant) => {
    Alert.alert('Delete Variant', `Remove "${v.label || 'variant'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteVariantMutation.mutate({ itemId: item.id, variantId: v.id }) },
    ]);
  };

  const confirmDeleteCategory = (cat: MenuCategory) => {
    Alert.alert('Delete Category', `Remove "${cat.name}"? Items will become uncategorized.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCategoryMutation.mutate(cat.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Menu</Text>
          <Text style={styles.headerSub}>{totalItems} items · {categories.length} categories</Text>
        </View>
        <TouchableOpacity
          style={styles.addCatBtn}
          onPress={() => setCategoryModal({ visible: true, editing: null })}>
          <Text style={styles.addCatText}>+ Category</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {categories.map(cat => (
          <CategorySection
            key={cat.id}
            category={cat}
            onEditCategory={() => setCategoryModal({ visible: true, editing: cat })}
            onDeleteCategory={() => confirmDeleteCategory(cat)}
            onEditItem={item => setItemModal({ visible: true, editing: item })}
            onDeleteItem={confirmDeleteItem}
            onAddVariant={item => setVariantModal({ visible: true, itemId: item.id, editing: null })}
            onEditVariant={(item, v) => setVariantModal({ visible: true, itemId: item.id, editing: v })}
            onDeleteVariant={confirmDeleteVariant}
            onToggleItemAvailable={(item, val) => updateItemAvailability.mutate({ id: item.id, val })}
            onToggleVariantAvailable={(item, v, val) => updateVariantAvailability.mutate({ itemId: item.id, variantId: v.id, val })}
          />
        ))}

        {uncategorized.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Uncategorized</Text>
                <Text style={styles.sectionCount}>{uncategorized.length}</Text>
              </View>
            </View>
            {uncategorized.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={() => setItemModal({ visible: true, editing: item })}
                onDelete={() => confirmDeleteItem(item)}
                onAddVariant={() => setVariantModal({ visible: true, itemId: item.id, editing: null })}
                onEditVariant={v => setVariantModal({ visible: true, itemId: item.id, editing: v })}
                onDeleteVariant={v => confirmDeleteVariant(item, v)}
                onToggleAvailable={val => updateItemAvailability.mutate({ id: item.id, val })}
                onToggleVariantAvailable={(v, val) => updateVariantAvailability.mutate({ itemId: item.id, variantId: v.id, val })}
              />
            ))}
          </View>
        )}

        {totalItems === 0 && (
          <View style={styles.emptyState}>
            <Leaf size={40} color={colors.border} />
            <Text style={styles.emptyText}>No menu items yet</Text>
            <Text style={styles.emptyHint}>Tap + to add your first item</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setItemModal({ visible: true, editing: null })}>
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      <ItemModal
        visible={itemModal.visible}
        editing={itemModal.editing}
        categories={categories}
        onClose={() => setItemModal({ visible: false, editing: null })}
        onSaved={upsertMenuItem}
      />

      <VariantModal
        visible={variantModal.visible}
        itemId={variantModal.itemId}
        editing={variantModal.editing}
        onClose={() => setVariantModal({ visible: false, itemId: '', editing: null })}
        onSaved={v => upsertVariant(variantModal.itemId, v)}
      />

      <CategoryModal
        visible={categoryModal.visible}
        editing={categoryModal.editing}
        onClose={() => setCategoryModal({ visible: false, editing: null })}
        onSaved={upsertCategory}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.navy },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  addCatBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  addCatText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  scrollContent: { padding: spacing.md, gap: spacing.md, paddingBottom: 100 },

  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.navy },
  sectionCount: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionActions: { flexDirection: 'row', gap: 4 },

  itemCard: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 },
  vegDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  itemDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  iconBtn: { padding: 4 },

  variantRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  variantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  variantPillOff: { opacity: 0.45 },
  variantLabel: { fontSize: 12, color: colors.textPrimary },
  variantLabelOff: { textDecorationLine: 'line-through', color: colors.textSecondary },
  addVariantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderStyle: 'dashed',
  },
  addVariantText: { fontSize: 12, color: colors.primary, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: spacing.sm },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptyHint: { fontSize: 14, color: colors.textSecondary },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  saveBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
