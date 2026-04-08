'use client';

import { Package } from 'lucide-react';
import React from 'react';
import { LowStockProduct } from '../types';

interface LowStockTableProps {
    products: LowStockProduct[];
    isLoading: boolean;
}

export default function LowStockTable({ products, isLoading }: LowStockTableProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-rose-500" />
                    Low Stock Products
                </h3>
            </div>
            <div className="overflow-y-auto max-h-[400px]">
                <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {isLoading && products.length === 0 ? (
                            <tr>
                                <td className="p-8 text-center" colSpan={2}>
                                    <div className="flex justify-center mb-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-600"></div>
                                    </div>
                                    <span className="text-sm text-slate-500">Loading stock data...</span>
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td className="p-12 text-center" colSpan={2}>
                                    <span className="text-sm text-slate-500 italic">No low stock items found.</span>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-600">
                                            {product.images?.[0] ? (
                                                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-1">{product.name}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                                            product.stock <= 5 
                                            ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' 
                                            : 'text-amber-600 bg-amber-50 dark:bg-amber-900/30'
                                        }`}>
                                            {product.stock} left
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
