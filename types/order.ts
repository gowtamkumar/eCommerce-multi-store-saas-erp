interface OrderItem {
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
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  items: OrderItem[];
  returns?: any[];
  createdAt: string;
  orderNotes?: string;
}
