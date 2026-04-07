'use client';

import { Truck, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import type { CourierIntegrationsProps } from '../types';

export default function CourierIntegrations({ settings, isPathaoConnected, isSteadfastConnected }: CourierIntegrationsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pathao Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                            <Truck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pathao</h3>
                            <p className="text-xs text-slate-500">Logistics & Delivery</p>
                        </div>
                    </div>
                    {isPathaoConnected ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Connected
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 rounded-full text-xs font-bold uppercase tracking-wider">
                            <XCircle className="w-3.5 h-3.5" />
                            Not Configured
                        </span>
                    )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    Automate your deliveries with Pathao. Create orders directly from your dashboard and track them in real-time.
                </p>
                <div className="flex items-center gap-4">
                    <a
                        href="https://merchant.pathao.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 uppercase tracking-widest"
                    >
                        Merchant Panel <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>

            {/* Steadfast Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Steadfast</h3>
                            <p className="text-xs text-slate-500">Courier Service</p>
                        </div>
                    </div>
                    {isSteadfastConnected ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Connected
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 rounded-full text-xs font-bold uppercase tracking-wider">
                            <XCircle className="w-3.5 h-3.5" />
                            Not Configured
                        </span>
                    )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    Reliable nationwide delivery with Steadfast Courier. Simplifies your shipment process with direct integration.
                </p>
                <div className="flex items-center gap-4">
                    <a
                        href="https://steadfast.com.bd/login"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 uppercase tracking-widest"
                    >
                        Merchant Panel <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}
