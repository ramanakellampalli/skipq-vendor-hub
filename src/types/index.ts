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
  name: string;
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
    fees: { platformFee: number; paymentTerminalFee: number; totalServiceFee: number };
    totalAmount: number;
  };
  timeline: { createdAt: string; estimatedReadyAt: string };
  items: OrderItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
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
