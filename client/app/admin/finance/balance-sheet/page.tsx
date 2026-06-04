import { BalanceSheetPage } from '@/features/admin/finance/components/balance-sheet/BalanceSheetPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Balance Sheet | Admin Dashboard',
    description: 'Snapshot of Assets, Liabilities, and Equity at this point in time.',
};

export default function BalanceSheetRoute() {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <BalanceSheetPage />
        </div>
    );
}
