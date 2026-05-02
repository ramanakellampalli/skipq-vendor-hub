import { create } from 'zustand';
import { Order, MenuItem, VendorProfile, ServiceRequest } from '../types';

interface VendorState {
  profile: VendorProfile | null;
  activeOrders: Order[];
  pastOrders: Order[];
  items: MenuItem[];
  serviceRequests: ServiceRequest[];
  isSynced: boolean;
  pendingAlertIds: Set<string>;
  editingItem: MenuItem | null;

  setSync: (data: {
    profile: VendorProfile;
    activeOrders: Order[];
    pastOrders: Order[];
    items: MenuItem[];
    serviceRequests: ServiceRequest[];
  }) => void;

  addServiceRequest: (sr: ServiceRequest) => void;

  setProfile: (profile: VendorProfile) => void;
  upsertOrder: (order: Order) => void;
  addAlertId: (id: string) => void;
  removeAlertId: (id: string) => void;

  setEditingItem: (item: MenuItem | null) => void;

  upsertMenuItem: (item: MenuItem) => void;
  removeMenuItem: (id: string) => void;

  reset: () => void;
}

export const useVendorStore = create<VendorState>(set => ({
  profile: null,
  activeOrders: [],
  pastOrders: [],
  items: [],
  serviceRequests: [],
  isSynced: false,
  pendingAlertIds: new Set<string>(),
  editingItem: null,

  setSync: ({ profile, activeOrders, pastOrders, items, serviceRequests }) => {
    const pendingAlertIds = new Set(
      activeOrders.filter(o => o.state.orderStatus === 'PENDING').map(o => o.id),
    );
    set({ profile: profile ?? null, activeOrders, pastOrders, items, serviceRequests: serviceRequests ?? [], isSynced: true, pendingAlertIds });
  },

  addServiceRequest: (sr) =>
    set(state => ({ serviceRequests: [sr, ...state.serviceRequests] })),

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

  setEditingItem: item => set({ editingItem: item }),

  upsertMenuItem: item =>
    set(state => {
      const exists = state.items.some(m => m.id === item.id);
      return {
        items: exists
          ? state.items.map(m => m.id === item.id ? item : m)
          : [...state.items, item],
      };
    }),

  removeMenuItem: id =>
    set(state => ({ items: state.items.filter(m => m.id !== id) })),

  addAlertId: (id) =>
    set(state => ({ pendingAlertIds: new Set([...state.pendingAlertIds, id]) })),

  removeAlertId: (id) =>
    set(state => {
      const next = new Set(state.pendingAlertIds);
      next.delete(id);
      return { pendingAlertIds: next };
    }),

  reset: () =>
    set({ profile: null, activeOrders: [], pastOrders: [], items: [], serviceRequests: [], isSynced: false, pendingAlertIds: new Set(), editingItem: null }),
}));
