import { Product } from "@/types/product";

export interface ProductPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ProductListProps {
    products: Product[];
    loading: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, newStatus: string) => void;
    onLandingPage: (product: Product) => void;
}

export type { Product };
