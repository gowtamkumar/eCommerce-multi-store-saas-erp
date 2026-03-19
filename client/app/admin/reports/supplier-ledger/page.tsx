import SupplierLedger from '@/features/admin/report/components/SupplierLedger';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Supplier Payment Ledger | Admin Dashboard',
    description: 'Track chronological payments and obligations for your suppliers',
};

export default function SupplierLedgerPage() {
    return <SupplierLedger />;
}
