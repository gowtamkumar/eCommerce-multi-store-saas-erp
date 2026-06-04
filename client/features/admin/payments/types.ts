export interface Payment {
    id: string;
    transactionId: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
    order?: {
        customerName: string;
    };
}

export interface PaymentPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaymentListPageProps {
    payments: Payment[];
    loading: boolean;
    searchQuery: string;
    onSearchQueryChange: (q: string) => void;
    pagination: PaymentPagination;
    onPageChange: (page: number) => void;
}
