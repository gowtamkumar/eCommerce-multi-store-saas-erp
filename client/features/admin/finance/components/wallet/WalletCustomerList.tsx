'use client';

import { ChevronRight, Loader2, Search, User } from 'lucide-react';
import type { WalletCustomerRow } from '../../types';

export interface WalletCustomerListProps {
    customers: WalletCustomerRow[];
    loading: boolean;
    search: string;
    selectedCustomerId: string | null;
    onSearchChange: (value: string) => void;
    onSelectCustomer: (customerId: string) => void;
}

export default function WalletCustomerList({
    customers,
    loading,
    search,
    selectedCustomerId,
    onSearchChange,
    onSelectCustomer,
}: WalletCustomerListProps) {
    return (
        <div className="lg:col-span-5 space-y-4">
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search customer by name, email, phone..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm"
                />
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden max-h-[600px] overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center py-20 text-slate-400 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                        Loading customers...
                    </div>
                ) : customers.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">
                        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No customers found
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {customers.map((customer) => (
                            <button
                                key={customer.id}
                                onClick={() => onSelectCustomer(customer.id)}
                                className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between transition-colors ${
                                    selectedCustomerId === customer.id ? 'bg-brand-50/50 dark:bg-brand-900/10 border-l-4 border-brand-600' : ''
                                }`}
                            >
                                <div className="min-w-0 flex-1 pr-4">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{customer.name}</h4>
                                    <p className="text-xs text-slate-400 truncate">{customer.email}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
