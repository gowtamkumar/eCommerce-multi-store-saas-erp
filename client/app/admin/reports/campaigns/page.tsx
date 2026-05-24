import CampaignReportDashboard from '@/features/admin/report/components/campaign/CampaignReportDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Campaign Performance Report | Admin Dashboard',
    description: 'Detailed analytics and delivery performance report for marketing campaigns',
};

export default function CampaignReportPage() {
    return <CampaignReportDashboard />;
}
