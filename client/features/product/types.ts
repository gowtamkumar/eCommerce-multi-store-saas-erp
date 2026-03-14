export interface ProductDetailsProps {
    product: any;
}


export interface Product {
    id: string;
    _id: string;
    name: string;
    price: number;
    images: string[];
    tagline?: string;
    discountAmount?: number;
    slug: string;
}

export interface RelatedProductsProps {
    currentProductId: string;
}


interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Brand {
    id: string;
    name: string;
}

export interface ProductFiltersProps {
    categories: Category[];
    brands: Brand[];
    isMobileOpen: boolean;
    onCloseMobile: () => void;
    settings?: any;
}