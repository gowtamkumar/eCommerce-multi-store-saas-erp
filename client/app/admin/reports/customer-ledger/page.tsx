import CustomerLedger from '@/features/admin/report/components/CustomerLedger';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Customer Ledger | Admin Dashboard',
    description: 'Track chronological payments and obligations for your customers',
};

export default function CustomerLedgerPage() {
    return <CustomerLedger />;
}
