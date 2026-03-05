'use client';

import InventoryDashboard from '@/features/inventory/components/InventoryDashboard';
import InventoryList from '@/features/inventory/components/InventoryList';
import { BarChart3, History } from 'lucide-react';
import { useState } from 'react';

export default function InventoryPage() {
    const [tab, setTab] = useState<'dashboard' | 'history'>('dashboard');

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit border border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setTab('dashboard')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${tab === 'dashboard'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    Stock Dashboard
                </button>
                <button
                    onClick={() => setTab('history')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${tab === 'history'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    <History className="w-4 h-4" />
                    Transaction History
                </button>
            </div>

            {tab === 'dashboard' ? <InventoryDashboard /> : <InventoryList />}
        </div>
    );
}
