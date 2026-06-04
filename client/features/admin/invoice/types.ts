'use client';

export type InvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED' | string;

export interface InvoiceItem {
    id: string;
    productId?: string;
    variantId?: string;
    quantity: number;
    price: number;
    product?: {
        name: string;
    };
}

export interface InvoiceOrder {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    address?: string;
    city?: string;
    deliveryZone?: string;
    totalAmount?: number;
    createdAt?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    shippingAddress?: {
        recipientName: string;
        phone: string;
        address: string;
        city?: string;
        zone?: string;
    };
    items?: InvoiceItem[];
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    orderId?: string;
    issueDate: string;
    dueDate?: string;
    status: InvoiceStatus;
    order?: InvoiceOrder;
}

export interface InvoiceResponse {
    items: Invoice[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface InvoiceDetailsModalProps {
    invoice: Invoice;
    onClose: () => void;
}
