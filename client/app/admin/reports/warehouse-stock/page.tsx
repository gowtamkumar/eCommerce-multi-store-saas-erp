import WarehouseStockDashboard from '@/features/admin/report/components/warehouse-stock/WarehouseStockDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Warehouse Stock Report | Admin Dashboard',
    description: 'Detailed inventory levels and asset valuation report filtered by warehouse',
};

export default function WarehouseStockReportPage() {
    return <WarehouseStockDashboard />;
}
