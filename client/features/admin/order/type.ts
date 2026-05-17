import { OrderStatus } from "@/lib/enums/order-status.enum";
import { PaymentStatus } from "@/lib/enums/payment-status.enum";
import { Order, OrderItem } from "@/types/order";
import { Product } from '@/types/product';
export interface OrderListPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface OrderListProps {
    orders: Order[];
    loading: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter?: string;
    onStatusFilterChange?: (value: string) => void;
    sourceFilter?: string;
    onSourceFilterChange?: (value: string) => void;
    paymentFilter?: string;
    onPaymentFilterChange?: (value: string) => void;
    onExportCSV?: () => void;
    pagination: OrderListPagination;
    onPageChange: (page: number) => void;
    onStatusChange: (id: string, newStatus: string) => void;
    onCourierSelect: (order: Order, courier: string) => void;
    selectedCourier: { [orderId: string]: string };
    isCreatingCourierOrder: (orderId: string) => boolean;
}

export interface CourierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    pendingOrder: { order: Order; courier: string } | null;
    isCreating: boolean;
}

export { OrderStatus, PaymentStatus };
export type { Order, OrderItem };

export interface SelectedItem {
    product: Product;
    variant?: any;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    taxAmount: number; // Added taxAmount
    totalAmount: number;
}
