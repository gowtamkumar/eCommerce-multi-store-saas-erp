import { RefundMethod, ReturnType } from "@/lib/enums/refund-method.enum";

export interface ReturnRequest {
  id: string;
  orderId: string;
  status:
    | "pending"
    | "approved"
    | "received"
    | "rejected"
    | "refunded"
    | "exchanged"
    | "cancelled";
  returnType: ReturnType;
  refundMethod: RefundMethod;
  reason: string;
  adminComment?: string;
  refundAmount?: number;
  exchangeOrderId?: string | null;
  receivedAt?: string | null;
  user?: {
    id?: string;
    name: string;
    email: string;
  };
  order?: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    items?: any[];
    userId?: string;
  };
  items: any[];
  createdAt: string;
  updatedAt?: string;
}

export interface ReturnListProps {
  returns: ReturnRequest[];
  loading: boolean;
  onStatusUpdate: (
    id: string,
    status: string,
    comment?: string,
    refundMethod?: RefundMethod,
  ) => void;
}

export interface ReturnModalProps {
  orderId: string;
  item: {
    id: string; // Order Item ID (not used for logic but unique key)
    productId: string;
    variantId?: string;
    productName: string;
    quantity: number;
    price: number;
    discount: number;
  };
  onClose: () => void;
  onSuccess: () => void;
  apiPath?: string;
}
