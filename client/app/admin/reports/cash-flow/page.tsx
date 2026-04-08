import CashFlowDashboard from '@/features/admin/report/components/CashFlowDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cash Flow | Admin Dashboard',
    description: 'Track money movement in and out of your business',
};

export default function CashFlowPage() {
    return <CashFlowDashboard />;
}
