export interface Page {
    id: string;
    title: string;
    slug: string;
    status: "draft" | "published";
    isHomePage: boolean;
    order: number;
    createdAt: string;
}

export type PageStatusFilter = "all" | "draft" | "published";

export interface PageDeleteTarget {
    isOpen: boolean;
    id: string;
    isHomePage: boolean;
}


export interface ProductSliderProps {
    headline?: string;
    source?: 'all' | 'collection' | 'manual';
    productIds?: string[];
    count?: number;
    collectionId?: string; // This is the category id
    layout?: 'slider' | 'grid';
    columns?: number;
    mobileColumns?: number;
    styles?: any;
}


export interface BannerSliderProps {
    settings?: any;
    styles?: any;
}
