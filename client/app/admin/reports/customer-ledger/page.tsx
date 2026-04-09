import CustomerLedgerDashboard from '@/features/admin/report/components/customer-ledger/CustomerLedgerDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Customer Payment Ledger | Admin Dashboard',
    description: 'Track chronological payments and settlements for your customers',
};

export default function CustomerLedgerPage() {
    return <CustomerLedgerDashboard />;
}
