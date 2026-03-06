import CashFlowReport from '@/features/report/components/CashFlowReport';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cash Flow Summary | Admin Dashboard',
    description: 'Monitor your business liquidity with a unified view of inflows and outflows',
};

export default function CashFlowPage() {
    return <CashFlowReport />;
}
