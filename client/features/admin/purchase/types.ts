export interface PurchaseOrder {
    id: string;
    referenceNumber: string;
    supplierId: string;
    totalAmount: number;
    paymentStatus?: string;
    status: 'DRAFT' | 'PENDING' | 'RECEIVED' | 'CANCELLED' | 'draft' | 'pending' | 'received' | 'cancelled';
    deliveryDate?: string;
    createdAt: string;
    updatedAt: string;
    supplier?: {
        id: string;
        name: string;
    };
}

export interface PurchaseOrderPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PurchaseOrderListProps {
    orders: PurchaseOrder[];
    loading: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    pagination: PurchaseOrderPagination;
    onPageChange: (page: number) => void;
    onReceive: (id: string) => void;
    isSearchLoading?: boolean;
}

export interface Warehouse {
    id: string;
    name: string;
    code: string;
}

export interface Branch {
    id: string;
    name: string;
    code: string;
}

export interface ReceiveProductsModalProps {
    order: any;
    warehouses: Warehouse[];
    branches: Branch[];
    onClose: () => void;
    onConfirm: (warehouseId: string, branchId: string) => Promise<void>;
}

export interface RecordPaymentModalProps {
    balance: number;
    onClose: () => void;
    onConfirm: (paymentData: {
        amount: string;
        paymentMethod: string;
        note: string;
        transactionId: string;
    }) => Promise<void>;
}

