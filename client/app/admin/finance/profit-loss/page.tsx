import { ProfitLossPage } from '@/features/admin/finance/components/profit-loss/ProfitLossPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Profit & Loss Statement | Admin Dashboard',
    description: 'General Ledger backed income statement with real-time transactional double-entry tracking.',
};

export default function ProfitLossRoute() {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <ProfitLossPage />
        </div>
    );
}
