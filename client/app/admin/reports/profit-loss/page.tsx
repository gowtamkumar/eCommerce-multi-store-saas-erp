import ProfitLossDashboard from '@/features/admin/report/components/profit-loss/ProfitLossDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Profit & Loss Report | Admin Dashboard',
    description: 'Detailed analysis of business profitability, revenue, and expenses',
};

export default function ProfitLossPage() {
    return <ProfitLossDashboard />;
}
