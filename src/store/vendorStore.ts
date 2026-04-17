import { create } from 'zustand';
import { Order, MenuItem, VendorProfile } from '../types';

interface VendorState {
  profile: VendorProfile | null;
  activeOrders: Order[];
  pastOrders: Order[];
  menuItems: MenuItem[];
  isSynced: boolean;

  setSync: (data: {
    profile: VendorProfile;
    activeOrders: Order[];
    pastOrders: Order[];
    menuItems: MenuItem[];
  }) => void;

  setProfile: (profile: VendorProfile) => void;
  upsertOrder: (order: Order) => void;
  setMenuItems: (items: MenuItem[]) => void;
  upsertMenuItem: (item: MenuItem) => void;
  removeMenuItem: (id: string) => void;
  reset: () => void;
}

export const useVendorStore = create<VendorState>(set => ({
  profile: null,
  activeOrders: [],
  pastOrders: [],
  menuItems: [],
  isSynced: false,

  setSync: ({ profile, activeOrders, pastOrders, menuItems }) =>
    set({ profile, activeOrders, pastOrders, menuItems, isSynced: true }),

  setProfile: profile => set({ profile }),

  upsertOrder: order =>
    set(state => {
      const isPast = ['COMPLETED', 'REJECTED'].includes(order.status);

      const removeFrom = (list: Order[]) => list.filter(o => o.id !== order.id);

      if (isPast) {
        return {
          activeOrders: removeFrom(state.activeOrders),
          pastOrders: [order, ...removeFrom(state.pastOrders)],
        };
      }

      const existsInActive = state.activeOrders.some(o => o.id === order.id);
      if (existsInActive) {
        return {
          activeOrders: state.activeOrders.map(o => o.id === order.id ? order : o),
        };
      }

      return {
        activeOrders: [order, ...removeFrom(state.activeOrders)],
      };
    }),

  setMenuItems: menuItems => set({ menuItems }),

  upsertMenuItem: item =>
    set(state => {
      const exists = state.menuItems.some(m => m.id === item.id);
      return {
        menuItems: exists
          ? state.menuItems.map(m => m.id === item.id ? item : m)
          : [...state.menuItems, item],
      };
    }),

  removeMenuItem: id =>
    set(state => ({ menuItems: state.menuItems.filter(m => m.id !== id) })),

  reset: () =>
    set({ profile: null, activeOrders: [], pastOrders: [], menuItems: [], isSynced: false }),
}));
