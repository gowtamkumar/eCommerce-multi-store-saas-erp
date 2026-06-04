import { GeneralLedgerPage } from '@/features/admin/finance/components/ledger/GeneralLedgerPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'General Ledger Audit | Admin Dashboard',
    description: 'Dual inventory movements ledger and immutable double-entry financial journals.',
};

export default function GeneralLedgerRoute() {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <GeneralLedgerPage />
        </div>
    );
}
