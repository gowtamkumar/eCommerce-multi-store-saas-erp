import SalesReport from '@/features/report/components/SalesReport';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sales Report | Admin Dashboard',
    description: 'Detailed analysis of your store sales and performance',
};

export default function SalesPage() {
    return <SalesReport />;
}
