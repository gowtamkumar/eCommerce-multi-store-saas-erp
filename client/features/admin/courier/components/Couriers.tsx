'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import CourierIntegrations from './CourierIntegrations';
import CourierActivityList from './CourierActivityList';
import { useCouriers } from '../hooks/useCouriers';

export default function Couriers() {
    const {
        settings,
        orders,
        loading,
        searchQuery,
        isPathaoConnected,
        isSteadfastConnected,
        handleSearchChange,
    } = useCouriers();

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Logistics Command</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Cross-platform fulfillment & tracking</p>
                </div>
                <Link
                    href="/admin/settings?tab=courier"
                    className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-3 shadow-sm hover:shadow-md"
                >
                    <ExternalLink className="w-4 h-4" />
                    Configure Partners
                </Link>
            </div>

            {/* Integration Status Cards */}
            <section className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Integration Ecosystem</h2>
                <CourierIntegrations 
                    settings={settings} 
                    isPathaoConnected={isPathaoConnected} 
                    isSteadfastConnected={isSteadfastConnected} 
                />
            </section>

            {/* Tracking Activity */}
            <section>
                <CourierActivityList 
                    orders={orders}
                    loading={loading}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                />
            </section>
        </div>
    );
}
