import { client } from './client';
import { Order, OrderStatus, MenuItem, VendorProfile } from '../types';

export interface SyncResponse {
  profile: VendorProfile;
  activeOrders: Order[];
  pastOrders: Order[];
  menuItems: MenuItem[];
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      client.post('/api/v1/auth/login', { email, password }),
    setupPassword: (token: string, newPassword: string) =>
      client.post('/api/v1/auth/setup-password', { token, newPassword }),
    setupAccount: (payload: {
      token: string;
      newPassword: string;
      businessName: string;
      pan: string;
      bankAccount: string;
      ifsc: string;
      gstRegistered: boolean;
      gstin?: string;
    }) => client.post('/api/v1/auth/setup-account', payload),
  },

  vendor: {
    sync: () =>
      client.get<SyncResponse>('/api/v1/vendor/sync'),
    getProfile: () =>
      client.get<VendorProfile>('/api/v1/vendor/profile'),
    updateProfile: (data: Partial<VendorProfile>) =>
      client.patch<VendorProfile>('/api/v1/vendor/profile', data),
  },

  orders: {
    getAll: () =>
      client.get<Order[]>('/api/v1/vendor/orders'),
    updateStatus: (orderId: string, status: OrderStatus) =>
      client.patch<Order>(`/api/v1/vendor/orders/${orderId}/status`, { status }),
  },

  menu: {
    getAll: () =>
      client.get<MenuItem[]>('/api/v1/vendor/menu'),
    create: (data: { name: string; price: number; isAvailable: boolean }) =>
      client.post<MenuItem>('/api/v1/vendor/menu', data),
    update: (id: string, data: Partial<MenuItem>) =>
      client.patch<MenuItem>(`/api/v1/vendor/menu/${id}`, data),
    delete: (id: string) =>
      client.delete(`/api/v1/vendor/menu/${id}`),
  },
};
