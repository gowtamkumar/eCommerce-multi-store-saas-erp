import FinanceDashboard from '@/features/admin/report/components/FinanceDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Finance Dashboard | Admin Dashboard',
    description: 'Unified financial health overview for your business',
};

export default function FinanceDashboardPage() {
    return <FinanceDashboard />;
}
