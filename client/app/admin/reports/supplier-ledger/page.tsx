import SupplierLedgerDashboard from '@/features/admin/report/components/supplier-ledger/SupplierLedgerDashboard';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Supplier Payment Ledger | Admin Dashboard',
    description: 'Track chronological payments and obligations for your suppliers',
};

export default function SupplierLedgerPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Loading Ledger...</div>}>
            <SupplierLedgerDashboard />
        </Suspense>
    );
}
