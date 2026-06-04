'use client';

import type { DashboardIcon } from '../../types';
import type { ReactNode } from 'react';

export function PanelHeader({
    icon: Icon,
    title,
    subtitle,
    action,
    iconClassName = 'text-brand-500',
}: {
    icon: DashboardIcon;
    title: string;
    subtitle?: string;
    action?: ReactNode;
    iconClassName?: string;
}) {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter italic">
                    <Icon className={`w-6 h-6 ${iconClassName}`} /> {title}
                </h3>
                {subtitle && (
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
            {action}
        </div>
    );
}

export function SkeletonList({ count, className }: { count: number; className: string }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={`${className} bg-slate-50 dark:bg-slate-900/30 animate-pulse`} />
            ))}
        </>
    );
}

export function EmptyState({
    icon: Icon,
    label,
    className = 'py-16 rounded-[32px]',
}: {
    icon: DashboardIcon;
    label: string;
    className?: string;
}) {
    return (
        <div className={`${className} text-center bg-slate-50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800`}>
            <Icon className="w-12 h-12 text-slate-200 mx-auto" strokeWidth={1} />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-4">{label}</p>
        </div>
    );
}

export function ProductThumb({
    image,
    name,
    sizeClassName = 'w-12 h-12',
    icon: Icon,
}: {
    image?: string;
    name: string;
    sizeClassName?: string;
    icon: DashboardIcon;
}) {
    return (
        <div className={`${sizeClassName} rounded-2xl bg-white dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-700 shrink-0`}>
            {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-300" />
                </div>
            )}
        </div>
    );
}
