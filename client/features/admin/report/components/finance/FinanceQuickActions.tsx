'use client';

import { Briefcase, ChevronRight, CreditCard, Wallet } from 'lucide-react';
import Link from 'next/link';
import React, { memo } from 'react';

const FinanceQuickActions = memo(() => {
    const actions = [
        {
            href: "/admin/reports/profit-loss",
            icon: Briefcase,
            title: "P&L Detailed",
            description: "Revenue vs COGS Breakdown",
            bgColor: "bg-brand-50 dark:bg-brand-900/30",
            iconColor: "text-brand-600",
            borderColor: "hover:border-brand-500",
            hoverIconColor: "group-hover:text-brand-600"
        },
        {
            href: "/admin/reports/cash-flow",
            icon: Wallet,
            title: "Cash Flow",
            description: "Liquidity & Wallet Trends",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
            iconColor: "text-emerald-600",
            borderColor: "hover:border-emerald-500",
            hoverIconColor: "group-hover:text-emerald-600"
        },
        {
            href: "/admin/reports/export",
            icon: CreditCard,
            title: "Tax & Exports",
            description: "Download Finance CSVs",
            bgColor: "bg-amber-50 dark:bg-amber-900/30",
            iconColor: "text-amber-600",
            borderColor: "hover:border-amber-500",
            hoverIconColor: "group-hover:text-amber-600"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actions.map((action) => (
                <Link 
                    key={action.title}
                    href={action.href} 
                    className={`p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 ${action.borderColor} hover:shadow-md transition-all group`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 ${action.bgColor} rounded-xl flex items-center justify-center`}>
                                <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white">{action.title}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{action.description}</p>
                            </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-slate-300 ${action.hoverIconColor} transition-colors`} />
                    </div>
                </Link>
            ))}
        </div>
    );
});

FinanceQuickActions.displayName = 'FinanceQuickActions';
export default FinanceQuickActions;
