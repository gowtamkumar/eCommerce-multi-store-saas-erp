export interface Product {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    stock: number;
    variants: any[];
}

export interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialProduct?: any;
    initialVariant?: any;
}

export interface VariantStock {
    id: string;
    sku: string;
    combination: Record<string, string>;
    price: number;
    stock: number;
    lowStockThreshold?: number;
}

export interface ProductStock {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    status: string;
    categoryName: string | null;
    supplierName: string | null;
    hasVariants: boolean;
    stock: number;
    stockValue: number;
    variants: VariantStock[];
    lowStock: boolean;
    outOfStock: boolean;
}

export type FilterType = 'all' | 'lowStock' | 'outOfStock' | 'inStock';

export interface InventoryStats {
    totalProducts: number;
    totalValue: number;
    outOfStockCount: number;
    lowStockCount: number;
    inStockCount: number;
}

export interface InventoryStockListProps {
    products: ProductStock[];
    filteredProducts: ProductStock[];
    loading: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    filter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    stats: InventoryStats;
    expandedIds: Set<string>;
    onToggleExpand: (id: string) => void;
    onAdjustProduct: (product: ProductStock) => void;
    onAdjustVariant: (product: ProductStock, variant: VariantStock) => void;
    formatPrice: (price: number) => string;
}