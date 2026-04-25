export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface OrderItem {
  menuItemId: string;
  variantId?: string;
  name: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  vendor: { id: string; name: string };
  state: { orderStatus: OrderStatus; paymentStatus: PaymentStatus };
  pricing: {
    subtotal: number;
    tax: { cgst: number; sgst: number; igst: number; totalTax: number };
    fees: { platformFee: number; totalServiceFee: number };
    totalAmount: number;
  };
  timeline: { createdAt: string; estimatedReadyAt: string };
  items: OrderItem[];
}

export interface MenuVariant {
  id: string;
  label?: string;
  price: number;
  isAvailable: boolean;
}

export interface MenuItem {
  id: string;
  categoryId?: string;
  name: string;
  description?: string;
  isVeg: boolean;
  isAvailable: boolean;
  displayOrder: number;
  variants: MenuVariant[];
}

export interface MenuCategory {
  id: string;
  name: string;
  displayOrder: number;
  items: MenuItem[];
}

export interface MonthlySummary {
  year: number;
  month: number;
  orderCount: number;
  grossRevenue: number;
  cgst: number;
  sgst: number;
  totalTax: number;
  platformFees: number;
  netPayout: number;
}

export interface VendorProfile {
  id: string;
  name: string;
  isOpen: boolean;
  prepTime: number;
  email: string;
  businessName?: string;
  gstRegistered: boolean;
  gstin?: string;
  kycApproved: boolean;
  campusName?: string;
}
