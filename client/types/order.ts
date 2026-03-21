export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalAmount: number;
  snapshot?: any;
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


export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  totalAmount: number;
  shippingFee?: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  trackingId?: string;
  courierStatus?: string;
  items: OrderItem[];
  returns?: any[];
  createdAt: string;
  orderNotes?: string;
  currency?: string;
  currencyRate?: number;
  deliveryZone?: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  order?: Order;
  userId: string;
  user?: any;
  status: string;
  reason: string;
  adminComment?: string;
  refundAmount?: number;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  users?: any; // Compatibility with existing code using 'users'
}
