import { FinancialDashboard } from '@/features/admin/finance/components/FinancialDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Financial Engine | Admin Dashboard',
    description: 'Real-time Profit & Loss and Balance Sheet powered by automated double-entry accounting.',
};

export default function FinancePage() {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <FinancialDashboard />
        </div>
    );
}
