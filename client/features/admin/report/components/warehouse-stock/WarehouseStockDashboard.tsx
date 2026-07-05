'use client';

import DataTable from '@/components/shared/DataTable';
import { useSettings } from '@/hooks/SettingsContext';
import { Warehouse } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useWarehouseStockReport } from '../../hooks/useWarehouseStockReport';
import type { WarehouseStockTableRow } from '../../types';
import WarehouseStockFilters from './WarehouseStockFilters';
import WarehouseStockHeader from './WarehouseStockHeader';
import WarehouseStockSummaryCards from './WarehouseStockSummaryCards';
import { buildWarehouseStockColumns } from './warehouseStockColumns';

export default function WarehouseStockDashboard() {
    const { formatPrice } = useSettings();
    const {
        branches,
        filteredWarehouses,
        selectedBranchId,
        selectedWarehouseId,
        filteredProducts,
        tableData,
        stats,
        filterCounts,
        loading,
        searchQuery,
        filter,
        expandedIds,
        setSearchQuery,
        setFilter,
        setSelectedWarehouseId,
        handleBranchChange,
        toggleExpand,
        exportCsv,
    } = useWarehouseStockReport();

    const columns = useMemo(
        () => buildWarehouseStockColumns({ expandedIds, formatPrice }),
        [expandedIds, formatPrice],
    );

    const getRowKey = useCallback(
        (item: WarehouseStockTableRow) => (item.isVariant ? `variant-${item.id}` : `product-${item.id}`),
        [],
    );

    const getRowClassName = useCallback(
        (item: WarehouseStockTableRow) => (item.isVariant ? 'bg-slate-50/50 dark:bg-slate-900/30 transition-all' : ''),
        [],
    );

    const handleRowClick = useCallback((item: WarehouseStockTableRow) => {
        if (item.isVariant) return;
        if (item.hasVariants) toggleExpand(item.id);
    }, [toggleExpand]);

    return (
        <div className="space-y-6">
            <WarehouseStockHeader
                branches={branches}
                warehouses={filteredWarehouses}
                selectedBranchId={selectedBranchId}
                selectedWarehouseId={selectedWarehouseId}
                isExportDisabled={loading || filteredProducts.length === 0}
                onBranchChange={handleBranchChange}
                onWarehouseChange={setSelectedWarehouseId}
                onExport={exportCsv}
            />

            <WarehouseStockSummaryCards stats={stats} formatPrice={formatPrice} />

            <WarehouseStockFilters
                filterCounts={filterCounts}
                activeFilter={filter}
                searchQuery={searchQuery}
                onFilterChange={setFilter}
                onSearchChange={setSearchQuery}
            />

            <DataTable
                data={tableData}
                columns={columns}
                getRowKey={getRowKey}
                loading={loading}
                loadingLabel="Reconciling branch/warehouse assets..."
                emptyLabel={
                    <div className="flex flex-col items-center gap-4 max-w-xs mx-auto py-12">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-2">
                            <Warehouse className="w-10 h-10 text-slate-200" strokeWidth={1} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">No stock found</p>
                            <p className="text-sm text-slate-500 font-medium">There are no matching items for the selected location or filters.</p>
                        </div>
                    </div>
                }
                rowClassName={getRowClassName}
                onRowClick={handleRowClick}
                minWidthClassName="min-w-[1000px]"
                containerClassName="rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
            />

            {!loading && filteredProducts.length > 0 && (
                <div className="flex items-center justify-between px-8 py-4 bg-slate-50/50 dark:bg-slate-900/40 border border-t-0 border-slate-100 dark:border-slate-700 rounded-[2.5rem] rounded-t-none -mt-6">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em]">
                        Branch/Warehouse assets reconciled: <span className="text-slate-900 dark:text-white underline decoration-brand-500 decoration-2 underline-offset-4">{filteredProducts.length} items</span>
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live data active</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                </div>
            )}
        </div>
    );
}
