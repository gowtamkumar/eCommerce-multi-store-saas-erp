import { ShippingZoneType } from "@/lib/enums/shipping-zone-type.enum";
import { ReturnStatus } from "@/lib/enums/return-status.enum";

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  snapshot?: OrderItemSnapshot;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  } | null;
  variant: {
    id: string;
    sku: string;
    combination: Record<string, string>;
  } | null;
}

export interface OrderItemSnapshot {
  productId?: string;
  productName?: string;
  productImage?: string;
  variantSku?: string;
  variantOptions?: Record<string, string>;
}


export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  shippingAddressId?: string;
  shippingAddress?: {
    id: string;
    label?: string;
    recipientName: string;
    phone: string;
    address: string;
    city?: string;
    zone?: ShippingZoneType;
    isDefault: boolean;
  };
  totalAmount: number;
  shippingFee?: number;
  taxAmount?: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  trackingId?: string;
  courierStatus?: string;
  orderSource?: "website" | "pos" | "manual" | string;
  items: OrderItem[];
  returns?: ReturnRequest[];
  createdAt: string;
  orderNotes?: string;
  currency?: string;
  currencyRate?: number;
  deliveryZone?: string;
  city?: string;
  appliedCoupon?: string;
  couponDiscountAmount?: number;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  order?: Order;
  userId: string;
  user?: {
    email?: string;
  };
  status: ReturnStatus;
  returnType?: string;   // 'refund' | 'exchange'
  refundMethod?: string; // 'store_credit' | 'cash' | 'card' | 'mobile' | 'bank_transfer'
  reason: string;
  adminComment?: string;
  refundAmount?: number;
  exchangeOrderId?: string | null;
  receivedAt?: string | null;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  createdAt: string;
  updatedAt: string;
  storeId: string;
  users?: unknown; // Compatibility with existing code using 'users'
}
