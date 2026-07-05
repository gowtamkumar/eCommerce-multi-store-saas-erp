
export interface Plan {
    id: string;
    name: string;
    price: number;
    monthlyPrice?: number;
    yearlyPrice?: number;
    currency?: string;
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
    storageUsage?: number;
    storageLimit?: number;
    activeAddons?: string[];
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

export interface InvoiceHistoryProps {
    history: BillingInvoice[];
}

export interface PlanCardProps {
    plan: Plan;
    isCurrent: boolean;
    billingCycle: 'monthly' | 'yearly';
    handleUpgrade: (id: string) => void;
    initiating: string | null;
}

export interface SubscriptionOverviewProps {
    subInfo: SubscriptionInfo | null;
    plans: Plan[];
    handleUpgrade: (id: string) => void;
    initiating: string | null;
}