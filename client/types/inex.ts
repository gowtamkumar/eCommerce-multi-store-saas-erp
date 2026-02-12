export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
}

export interface PriceProps {
    amount: number;
    className?: string;
    showOriginal?: boolean;
    originalAmount?: number;
}

export interface HeroProps {
    content: {
        heading?: string;
        subtext?: string;
    };
}


export interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    altText?: string;
}