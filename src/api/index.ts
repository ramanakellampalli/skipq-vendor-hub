import { client } from './client';
import { Order, OrderStatus, MenuItem, MenuCategory, MenuVariant, VendorProfile, ServiceRequest, ServiceRequestType } from '../types';

export interface SyncResponse {
  profile: VendorProfile;
  activeOrders: Order[];
  pastOrders: Order[];
  categories: MenuCategory[];
  uncategorized: MenuItem[];
  serviceRequests: ServiceRequest[];
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
    deleteAccount: () =>
      client.delete('/api/v1/vendor/account'),
    registerDeviceToken: (token: string) =>
      client.put('/api/v1/shared/device-token', { token }),
  },

  support: {
    create: (data: { type: ServiceRequestType; description: string }) =>
      client.post<ServiceRequest>('/api/v1/support', data),
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
    create: (data: { name: string; description?: string; isVeg: boolean; categoryId?: string; displayOrder?: number }) =>
      client.post<MenuItem>('/api/v1/vendor/menu', data),
    update: (id: string, data: { name?: string; description?: string; isVeg?: boolean; isAvailable?: boolean; categoryId?: string; displayOrder?: number }) =>
      client.patch<MenuItem>(`/api/v1/vendor/menu/${id}`, data),
    delete: (id: string) =>
      client.delete(`/api/v1/vendor/menu/${id}`),
  },

  categories: {
    getAll: () =>
      client.get<MenuCategory[]>('/api/v1/vendor/menu/categories'),
    create: (data: { name: string; displayOrder?: number }) =>
      client.post<MenuCategory>('/api/v1/vendor/menu/categories', data),
    update: (id: string, data: { name?: string; displayOrder?: number }) =>
      client.patch<MenuCategory>(`/api/v1/vendor/menu/categories/${id}`, data),
    delete: (id: string) =>
      client.delete(`/api/v1/vendor/menu/categories/${id}`),
  },

  variants: {
    add: (itemId: string, data: { label?: string; price: number; isAvailable?: boolean; displayOrder?: number }) =>
      client.post<MenuVariant>(`/api/v1/vendor/menu/${itemId}/variants`, data),
    update: (itemId: string, variantId: string, data: { label?: string; price?: number; isAvailable?: boolean; displayOrder?: number }) =>
      client.patch<MenuVariant>(`/api/v1/vendor/menu/${itemId}/variants/${variantId}`, data),
    delete: (itemId: string, variantId: string) =>
      client.delete(`/api/v1/vendor/menu/${itemId}/variants/${variantId}`),
  },
};
