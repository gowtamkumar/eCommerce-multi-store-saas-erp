'use client';

import type { SalesTablesSectionProps } from '../../types';
import LowStockTable from './LowStockTable';
import RecentProductsTable from './RecentProductsTable';

export default function SalesTablesSection({
    lowStockProducts,
    recentProducts,
    isLoading,
}: SalesTablesSectionProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            <LowStockTable
                products={lowStockProducts}
                isLoading={isLoading}
            />
            <RecentProductsTable
                products={recentProducts}
                isLoading={isLoading}
            />
        </div>
    );
}
