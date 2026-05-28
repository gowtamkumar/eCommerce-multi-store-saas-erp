export interface PurchaseOrder {
    id: string;
    referenceNumber: string;
    supplierId: string;
    totalAmount: number;
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
