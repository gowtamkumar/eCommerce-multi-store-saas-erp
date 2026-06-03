'use client';

import { navGroups } from '@/routes';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbNavItem = {
    href?: string;
    label?: string;
};

type BreadcrumbNavGroup = {
    items: BreadcrumbNavItem[];
};

// Build a lookup of href -> human label from the nav config (best-effort).
const HREF_LABELS: Record<string, string> = (() => {
    const map: Record<string, string> = {};
    for (const group of navGroups as BreadcrumbNavGroup[]) {
        for (const item of group.items || []) {
            if (item.href && item.label) {
                map[item.href.split('?')[0]] = item.label;
            }
        }
    }
    return map;
})();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function titleize(segment: string): string {
    if (UUID_RE.test(segment) || /^\d+$/.test(segment)) return 'Detail';
    return segment
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminBreadcrumbs() {
    const pathname = usePathname();

    const crumbs = useMemo(() => {
        if (!pathname) return [];
        const segments = pathname.split('/').filter(Boolean); // e.g. ['admin','procurement','purchases','<id>']
        const items: { label: string; href: string; isLast: boolean }[] = [];
        let acc = '';
        segments.forEach((seg, i) => {
            acc += `/${seg}`;
            if (seg === 'admin') return; // represented by the Home icon
            const label = HREF_LABELS[acc] || titleize(seg);
            items.push({ label, href: acc, isLast: i === segments.length - 1 });
        });
        return items;
    }, [pathname]);

    // Hide on the dashboard root (nothing meaningful to show).
    if (pathname === '/admin' || crumbs.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs font-bold print:hidden">
            <Link
                href="/admin"
                className="flex items-center gap-1 text-slate-400 hover:text-brand-600 transition-colors"
            >
                <Home className="w-3.5 h-3.5" />
            </Link>
            {crumbs.map((c) => (
                <span key={c.href} className="flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                    {c.isLast ? (
                        <span className="text-slate-700 dark:text-slate-200 uppercase tracking-widest">{c.label}</span>
                    ) : (
                        <Link
                            href={c.href}
                            className="text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-widest"
                        >
                            {c.label}
                        </Link>
                    )}
                </span>
            ))}
        </nav>
    );
}
