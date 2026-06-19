export interface CartItemSummary {
    productName?: string;
    quantity: number;
    basePrice?: number;
}

export interface CartSummary {
    id: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    itemCount: number;
    totalAmount?: number;
    updatedAt?: string;
    isAbandoned?: boolean;
    hasAiDraft?: boolean;
    hoursSinceUpdate?: number;
    items?: CartItemSummary[];
}
