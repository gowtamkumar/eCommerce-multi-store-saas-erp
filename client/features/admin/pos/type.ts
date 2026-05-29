export interface Register {
  id: string;
  name: string;
  branchId?: string;
}

export interface PosShift {
  id: string;
  registerId: string;
  userId: string;
  openingBalance: number;
  cashSales: number;
  cardSales: number;
  mobileSales: number;
  cashIn?: number;
  cashOut?: number;
  expectedClosingBalance: number;
  closingBalance?: number;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt?: string;
  register?: Register;
}

export interface Category {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface ProductVariant {
  id: string;
  price?: number;
  combination: Record<string, string>;
  sku?: string;
  barcode?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  stock: number;
  price: number;
  sku?: string;
  barcode?: string;
  images?: string[];
  variants?: ProductVariant[];
  taxRate?: number;
  discountAmount?: number | string;
  discountType?: string;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

export interface ReturnOrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number | string;
  product?: {
    name?: string;
  };
  variant?: ProductVariant;
}

export interface ReturnRecord {
  status: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
}

export interface ReturnOrder {
  id: string;
  user?: Customer | null;
  items: ReturnOrderItem[];
  returns?: ReturnRecord[];
}

export interface CouponApplied {
  code: string;
  discountAmount: number;
}

export interface TransactionItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

export interface TransactionHistory {
  receiptNo: string;
  date: string;
  items: TransactionItem[];
  subtotal: number;
  catalogDiscount: number;
  discount: number;
  couponDiscount: number;
  couponCode?: string | null;
  shippingFee: number;
  deliveryZone?: string | null;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  amountTendered: number;
  changeDue: number;
  walletDeduction: number;
  customer?: Customer | null;
  isOffline?: boolean;
  splitPayments?: { method: string; amount: number }[];
}

export interface OfflineSale {
  shiftId: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod: string;
  paymentAmount: number;
  customerId?: string;
  appliedCoupon?: string;
  couponDiscountAmount: number;
  deliveryZone?: string;
  shippingFee: number;
  shippingAddress?: string;
  useWalletBalance?: boolean;
  walletAmountToUse?: number;
  offlineSaleId: string;
  createdAt: string;
  payments?: {
    method: "cash" | "card" | "mobile" | "on_account";
    amount: number;
  }[];
  _metadata?: {
    customerName: string;
    grandTotal: number;
    itemsCount: number;
  };
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number;
  category: string;
  isActive: boolean;
}
