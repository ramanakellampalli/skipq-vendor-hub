import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Leaf } from 'lucide-react-native';
import { api } from '../../api';
import { colors, radius, spacing } from '../../theme';
import { MenuItem } from '../../types';
import { useVendorStore } from '../../store/vendorStore';

// ─── MenuItem card ────────────────────────────────────────────────────────────

interface ItemCardProps {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailable: (val: boolean) => void;
}

function ItemCard({ item, onEdit, onDelete, onToggleAvailable }: ItemCardProps) {
  const priceDisplay = () => {
    if (!item.variants.length) return `₹${item.price.toFixed(2)}`;
    const prices = item.variants.map(v => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `₹${min.toFixed(2)}` : `₹${min.toFixed(2)} – ₹${max.toFixed(2)}`;
  };

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemLeft}>
          {/* eslint-disable-next-line react-native/no-inline-styles */}
          <View style={[styles.vegDot, { backgroundColor: item.isVeg ? colors.success : '#e53935' }]} />
          <View style={styles.itemFlex}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
            ) : null}
            <Text style={styles.itemPrice}>{priceDisplay()}</Text>
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

      {item.variants.length > 0 && (
        <View style={styles.variantRow}>
          {item.variants.map(v => (
            <View key={v.id} style={[styles.variantPill, !v.isAvailable && styles.variantPillOff]}>
              <Text style={[styles.variantLabel, !v.isAvailable && styles.variantLabelOff]}>
                {v.label ? `${v.label} · ` : ''}₹{v.price.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Category section ─────────────────────────────────────────────────────────

interface CategorySectionProps {
  title: string;
  items: MenuItem[];
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (item: MenuItem) => void;
  onToggleItemAvailable: (item: MenuItem, val: boolean) => void;
}

function CategorySection({ title, items, onEditItem, onDeleteItem, onToggleItemAvailable }: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={() => setCollapsed(v => !v)}>
        <View style={styles.sectionHeaderLeft}>
          {collapsed
            ? <ChevronRight size={16} color={colors.textSecondary} />
            : <ChevronDown size={16} color={colors.textSecondary} />}
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCount}>{items.length}</Text>
        </View>
      </TouchableOpacity>

      {!collapsed && items.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          onEdit={() => onEditItem(item)}
          onDelete={() => onDeleteItem(item)}
          onToggleAvailable={val => onToggleItemAvailable(item, val)}
        />
      ))}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MenuScreen({ navigation }: any) {
  const items          = useVendorStore(s => s.items);
  const setEditingItem = useVendorStore(s => s.setEditingItem);
  const upsertMenuItem = useVendorStore(s => s.upsertMenuItem);
  const removeMenuItem = useVendorStore(s => s.removeMenuItem);

  const grouped = React.useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of items) {
      const key = item.category || 'Other';
      const group = map.get(key) ?? [];
      group.push(item);
      map.set(key, group);
    }
    return map;
  }, [items]);

  const updateItemAvailability = useMutation({
    mutationFn: ({ id, val }: { id: string; val: boolean }) => api.menu.update(id, { isAvailable: val }),
    onSuccess: res => upsertMenuItem(res.data),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => api.menu.delete(id),
    onSuccess: (_, id) => removeMenuItem(id),
  });

  const confirmDeleteItem = (item: MenuItem) => {
    Alert.alert('Delete Item', `Remove "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItemMutation.mutate(item.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Menu</Text>
          <Text style={styles.headerSub}>{items.length} items</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => { setEditingItem(null); navigation.navigate('AddMenuItem'); }}
          activeOpacity={0.8}>
          <Plus size={14} color="#fff" />
          <Text style={styles.addBtnText}>Add item</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {[...grouped.entries()].map(([title, groupItems]) => (
          <CategorySection
            key={title}
            title={title}
            items={groupItems}
            onEditItem={item => { setEditingItem(item); navigation.navigate('AddMenuItem'); }}
            onDeleteItem={confirmDeleteItem}
            onToggleItemAvailable={(item, val) => updateItemAvailability.mutate({ id: item.id, val })}
          />
        ))}

        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Leaf size={40} color={colors.border} />
            <Text style={styles.emptyText}>No menu items yet</Text>
            <Text style={styles.emptyHint}>Tap + to add your first item</Text>
          </View>
        )}
      </ScrollView>
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  addBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
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
  itemFlex: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  itemDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  iconBtn: { padding: 4 },

  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  variantPill: {
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

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: spacing.sm },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptyHint: { fontSize: 14, color: colors.textSecondary },
});
