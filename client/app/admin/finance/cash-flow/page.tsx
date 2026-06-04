import CashFlowPage from '@/features/admin/finance/components/cash-flow/CashFlowPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cash Flow Statement | Admin Dashboard',
    description: 'Statement of Cash Flows (Direct Method) across operating, investing, and financing activities.',
};

export default function CashFlowRoute() {
    return <CashFlowPage />;
}
