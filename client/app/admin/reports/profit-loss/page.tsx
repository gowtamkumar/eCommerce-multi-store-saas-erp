import ProfitLossReport from '@/features/report/components/ProfitLossReport';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Profit & Loss Report | Admin Dashboard',
    description: 'View your business profitability and expense breakdown',
};

export default function ProfitLossPage() {
    return <ProfitLossReport />;
}
