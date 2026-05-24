import MarketingReportDashboard from '@/features/admin/report/components/marketing/MarketingReportDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Marketing & Campaign Performance Dashboard | Admin Dashboard',
    description: 'Unified dashboard for campaign stats, coupon redemption, and subscribers reporting',
};

export default function MarketingReportPage() {
    return <MarketingReportDashboard />;
}
