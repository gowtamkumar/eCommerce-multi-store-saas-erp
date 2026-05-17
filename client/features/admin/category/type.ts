export interface Category {
    id?: string;
    name: string;
    slug: string;
    description: string;
    image?: string;
    isActive?: boolean;
    sortOrder?: number;
    parentId?: string | null;
    parent?: { id: string; name: string } | null;
    children?: Category[];
    productCount?: number;
}

export interface CategoryListProps {
    categories: Category[];
    loading: boolean;
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}

export interface CategoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Category) => Promise<void>;
    initialData?: Category | null;
    allCategories?: Category[]; // for parent picker
}
