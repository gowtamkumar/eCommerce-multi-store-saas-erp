'use client';

import { Building2, Download, Warehouse } from 'lucide-react';
import type { WarehouseStockHeaderProps } from '../../types';

export default function WarehouseStockHeader({
    branches,
    warehouses,
    selectedBranchId,
    selectedWarehouseId,
    isExportDisabled,
    onBranchChange,
    onWarehouseChange,
    onExport,
}: WarehouseStockHeaderProps) {
    return (
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div>
                <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <Warehouse className="w-6 h-6 text-brand-600" />
                    Warehouse & Branch Stock Report
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Track stock levels, valuations, and availability grouped by branch location and warehouse.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <select
                        value={selectedBranchId}
                        onChange={(e) => onBranchChange(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all cursor-pointer font-semibold text-slate-800 dark:text-slate-200"
                    >
                        <option value="">All Branches</option>
                        {branches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-slate-400" />
                    <select
                        value={selectedWarehouseId}
                        onChange={(e) => onWarehouseChange(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all cursor-pointer font-semibold text-slate-800 dark:text-slate-200"
                    >
                        <option value="all">
                            {selectedBranchId ? 'All Branch Warehouses' : 'All Warehouses (Global)'}
                        </option>
                        {warehouses.map((w) => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={onExport}
                    disabled={isExportDisabled}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl transition-all font-medium border border-transparent disabled:opacity-50"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>
        </div>
    );
}
