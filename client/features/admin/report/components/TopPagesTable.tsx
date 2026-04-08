'use client';

import dayjs from 'dayjs';
import { FileText } from 'lucide-react';
import React from 'react';
import type { RecentPage } from '../types';

interface TopPagesTableProps {
    pages: RecentPage[];
    isLoading: boolean;
}

export default function TopPagesTable({ pages, isLoading }: TopPagesTableProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                Recent Top Pages
            </div>
            <div className="overflow-y-auto max-h-[400px]">
                <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {isLoading && pages.length === 0 ? (
                            <tr>
                                <td className="p-8 text-center" colSpan={2}>
                                    <div className="flex justify-center mb-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-600"></div>
                                    </div>
                                    <span className="text-sm text-slate-500">Loading page data...</span>
                                </td>
                            </tr>
                        ) : pages.length === 0 ? (
                            <tr>
                                <td className="p-12 text-center" colSpan={2}>
                                    <span className="text-sm text-slate-500 italic">No recent pages found.</span>
                                </td>
                            </tr>
                        ) : (
                            pages.map((page) => (
                                <tr key={page.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="p-4">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 block truncate" title={page.title}>
                                            {page.title}
                                        </span>
                                        <p className="text-xs text-slate-400 font-mono truncate">/{page.slug}</p>
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap">
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                                            {dayjs(page.createdAt).format('MMM D')}
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
