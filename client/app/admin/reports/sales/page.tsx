import SalesAnalysisDashboard from '@/features/admin/report/components/SalesAnalysisDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sales Analysis | Admin Dashboard',
    description: 'Detailed analysis of your store sales and performance',
};

export default function SalesPage() {
    return <SalesAnalysisDashboard />;
}
