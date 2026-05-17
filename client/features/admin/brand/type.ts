export interface Brand {
    id?: string;
    name: string;
    slug: string;
    description: string;
    image?: string;
    website?: string;
    productCount?: number;
    isActive?: boolean;
}

export interface BrandFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Brand) => Promise<void>;
    initialData?: Brand | null;
}

export interface BrandListProps {
    brands: Brand[];
    loading: boolean;
    onEdit: (brand: Brand) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}

export interface BrandGridProps {
    sectionId?: string;
    title?: string;
    count?: number;
    source?: 'all' | 'manual';
    items?: any[];
    columns?: number;
    mobileColumns?: number;
    styles?: any;
    layout?: 'grid' | 'slider';
}
