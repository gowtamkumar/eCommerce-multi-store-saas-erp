import ReportExport from '@/features/admin/report/components/ReportExport';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Financial Reports Export | Admin Dashboard',
    description: 'Export your financial data to CSV for accounting and analysis',
};

export default function ExportPage() {
    return <ReportExport />;
}
