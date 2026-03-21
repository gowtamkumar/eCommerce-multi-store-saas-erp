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