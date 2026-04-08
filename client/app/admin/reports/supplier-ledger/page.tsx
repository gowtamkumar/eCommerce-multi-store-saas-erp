import SupplierLedgerDashboard from '@/features/admin/report/components/SupplierLedgerDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Supplier Payment Ledger | Admin Dashboard',
    description: 'Track chronological payments and obligations for your suppliers',
};

export default function SupplierLedgerPage() {
    return <SupplierLedgerDashboard />;
}
