import { create } from 'zustand';
import { Order, MenuItem, MenuCategory, MenuVariant, VendorProfile } from '../types';

interface VendorState {
  profile: VendorProfile | null;
  activeOrders: Order[];
  pastOrders: Order[];
  categories: MenuCategory[];
  uncategorized: MenuItem[];
  isSynced: boolean;

  setSync: (data: {
    profile: VendorProfile;
    activeOrders: Order[];
    pastOrders: Order[];
    categories: MenuCategory[];
    uncategorized: MenuItem[];
  }) => void;

  setProfile: (profile: VendorProfile) => void;
  upsertOrder: (order: Order) => void;

  upsertCategory: (category: MenuCategory) => void;
  removeCategory: (id: string) => void;

  upsertMenuItem: (item: MenuItem) => void;
  removeMenuItem: (id: string) => void;

  upsertVariant: (itemId: string, variant: MenuVariant) => void;
  removeVariant: (itemId: string, variantId: string) => void;

  reset: () => void;
}

function upsertItemInList(items: MenuItem[], item: MenuItem): MenuItem[] {
  const exists = items.some(m => m.id === item.id);
  return exists ? items.map(m => m.id === item.id ? item : m) : [...items, item];
}

export const useVendorStore = create<VendorState>(set => ({
  profile: null,
  activeOrders: [],
  pastOrders: [],
  categories: [],
  uncategorized: [],
  isSynced: false,

  setSync: ({ profile, activeOrders, pastOrders, categories, uncategorized }) =>
    set({ profile: profile ?? null, activeOrders, pastOrders, categories, uncategorized, isSynced: true }),

  setProfile: profile => set({ profile }),

  upsertOrder: order =>
    set(state => {
      const isPast = ['COMPLETED', 'REJECTED'].includes(order.state.orderStatus);
      const removeFrom = (list: Order[]) => list.filter(o => o.id !== order.id);

      if (isPast) {
        return {
          activeOrders: removeFrom(state.activeOrders),
          pastOrders: [order, ...removeFrom(state.pastOrders)],
        };
      }

      const existsInActive = state.activeOrders.some(o => o.id === order.id);
      if (existsInActive) {
        return { activeOrders: state.activeOrders.map(o => o.id === order.id ? order : o) };
      }

      return { activeOrders: [order, ...removeFrom(state.activeOrders)] };
    }),

  upsertCategory: category =>
    set(state => {
      const exists = state.categories.some(c => c.id === category.id);
      return {
        categories: exists
          ? state.categories.map(c => c.id === category.id ? category : c)
          : [...state.categories, category],
      };
    }),

  removeCategory: id =>
    set(state => ({ categories: state.categories.filter(c => c.id !== id) })),

  upsertMenuItem: item =>
    set(state => {
      if (!item.categoryId) {
        return { uncategorized: upsertItemInList(state.uncategorized, item) };
      }
      return {
        categories: state.categories.map(c =>
          c.id === item.categoryId
            ? { ...c, items: upsertItemInList(c.items, item) }
            : c
        ),
        uncategorized: state.uncategorized.filter(m => m.id !== item.id),
      };
    }),

  removeMenuItem: id =>
    set(state => ({
      uncategorized: state.uncategorized.filter(m => m.id !== id),
      categories: state.categories.map(c => ({
        ...c,
        items: c.items.filter(m => m.id !== id),
      })),
    })),

  upsertVariant: (itemId, variant) =>
    set(state => {
      const patchVariants = (items: MenuItem[]) =>
        items.map(m => {
          if (m.id !== itemId) return m;
          const exists = m.variants.some(v => v.id === variant.id);
          return {
            ...m,
            variants: exists
              ? m.variants.map(v => v.id === variant.id ? variant : v)
              : [...m.variants, variant],
          };
        });

      return {
        uncategorized: patchVariants(state.uncategorized),
        categories: state.categories.map(c => ({ ...c, items: patchVariants(c.items) })),
      };
    }),

  removeVariant: (itemId, variantId) =>
    set(state => {
      const patch = (items: MenuItem[]) =>
        items.map(m =>
          m.id === itemId
            ? { ...m, variants: m.variants.filter(v => v.id !== variantId) }
            : m
        );

      return {
        uncategorized: patch(state.uncategorized),
        categories: state.categories.map(c => ({ ...c, items: patch(c.items) })),
      };
    }),

  reset: () =>
    set({ profile: null, activeOrders: [], pastOrders: [], categories: [], uncategorized: [], isSynced: false }),
}));
