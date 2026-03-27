
export interface Plan {
    id: string;
    name: string;
    price: number;
    features: string[];
    description: string;
}

export interface SubscriptionInfo {
    planName: string;
    status: string;
    startsAt: string;
    endsAt: string;
    billingCycle: string;
    isExpired: boolean;
}

export interface BillingInvoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    status: string;
    billingDate: string;
    plan: { name: string };
}
