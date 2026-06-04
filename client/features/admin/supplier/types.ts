export interface Supplier {
    id: string;
    name: string;
    code?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    category?: {
        id?: string;
        name?: string;
    };
    rating?: number;
    leadTimeDays?: number;
    outstandingBalance?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface SupplierListProps {
    suppliers: Supplier[];
    loading: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    pagination: PaginationState;
    onPageChange: (page: number) => void;
    onAdd: () => void;
    onEdit: (supplier: Supplier) => void;
    onDelete: (id: string) => void;
    isSearchLoading: boolean;
}

export interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    supplier?: Supplier;
}
