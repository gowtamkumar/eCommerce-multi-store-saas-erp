import { Product } from "@/types/product";

export interface ProductPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type ProductSortField = 'name' | 'price';
export type ProductSortOrder = 'ASC' | 'DESC';

export interface ProductListProps {
    products: Product[];
    loading: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    sortBy?: ProductSortField;
    sortOrder: ProductSortOrder;
    onSortChange: (value: ProductSortField) => void;
    pagination: ProductPagination;
    onPageChange: (page: number) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, newStatus: string) => void;
    onLandingPage: (product: Product) => void;
    filterLowStock: boolean;
    onLowStockToggle: () => void;
}

export type { Product };
