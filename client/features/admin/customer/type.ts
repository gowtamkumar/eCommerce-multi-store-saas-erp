export interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    phone?: string;
    status: string;
    createdAt: string;
    // B2B Credit Fields
    companyName?: string;
    customerCode?: string;
    taxId?: string;
    creditLimit?: number;
    creditHold?: boolean;
    preferredBranchId?: string;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CustomerListProps {
    users: User[];
    loading: boolean;
    pagination: Pagination;
    onPageChange: (page: number) => void;
    onDelete: (id: string) => void;
    onEdit: (user: User) => void;
    onAdd: () => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

export interface CustomerFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: User | null;
}

export interface ArAgingRow {
    customerId: string;
    customerName: string;
    customerEmail: string;
    companyName: string;
    creditLimit: number;
    creditHold: boolean;
    totalOutstanding: number;
    aging: {
        current: number;
        '1-30': number;
        '31-60': number;
        '61-90': number;
        '90+': number;
    };
}
