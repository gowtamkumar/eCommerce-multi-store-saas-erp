'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { ComponentType, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type IconComponent = ComponentType<{ className?: string }>;

export interface PaletteItem {
    href: string;
    label: string;
    group: string;
    icon?: IconComponent;
}

type PaletteNavItem = {
    type?: string;
    href?: string;
    label?: string;
    icon?: IconComponent;
};

type PaletteNavGroup = {
    title: string;
    items: PaletteNavItem[];
}

interface CommandPaletteProps {
    open: boolean;
    onClose: () => void;
    groups: PaletteNavGroup[];
}

const RECENTS_KEY = 'admin:recentPages';
const MAX_RECENTS = 6;

function readRecents(): PaletteItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(RECENTS_KEY);
        return raw ? (JSON.parse(raw) as PaletteItem[]) : [];
    } catch {
        return [];
    }
}

export function recordRecentPage(item: PaletteItem) {
    if (typeof window === 'undefined') return;
    try {
        const existing = readRecents().filter((r) => r.href !== item.href);
        const next = [{ href: item.href, label: item.label, group: item.group }, ...existing].slice(0, MAX_RECENTS);
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
        /* ignore persistence errors */
    }
}

export default function CommandPalette({ open, onClose, groups }: CommandPaletteProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [recents, setRecents] = useState<PaletteItem[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Flatten role/feature-filtered nav groups into navigable entries.
    const allItems = useMemo<PaletteItem[]>(() => {
        const items: PaletteItem[] = [];
        for (const group of groups) {
            for (const item of group.items || []) {
                if (item.type === 'header' || !item.href || !item.label) continue;
                items.push({ href: item.href, label: item.label, group: group.title, icon: item.icon });
            }
        }
        return items;
    }, [groups]);

    useEffect(() => {
        if (open) {
            const t = setTimeout(() => {
                setQuery('');
                setActiveIndex(0);
                setRecents(readRecents());
                inputRef.current?.focus();
            }, 30);
            return () => clearTimeout(t);
        }
    }, [open]);

    const results = useMemo<PaletteItem[]>(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            // Show recents first (resolved against current nav), then everything else.
            const recentHrefs = new Set(recents.map((r) => r.href));
            const resolvedRecents = recents
                .map((r) => allItems.find((i) => i.href === r.href))
                .filter(Boolean) as PaletteItem[];
            const rest = allItems.filter((i) => !recentHrefs.has(i.href));
            return [...resolvedRecents, ...rest];
        }
        return allItems.filter(
            (i) => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q),
        );
    }, [query, allItems, recents]);

    const showRecentsHeader = !query.trim() && recents.length > 0;
    const safeActiveIndex = Math.min(activeIndex, Math.max(results.length - 1, 0));

    const navigate = useCallback(
        (item: PaletteItem) => {
            recordRecentPage(item);
            onClose();
            router.push(item.href);
        },
        [onClose, router],
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const item = results[safeActiveIndex];
            if (item) navigate(item);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    };

    // Keep the active row in view.
    useEffect(() => {
        const el = listRef.current?.querySelector(`[data-index="${safeActiveIndex}"]`);
        if (el) (el as HTMLElement).scrollIntoView({ block: 'nearest' });
    }, [safeActiveIndex]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-120 flex items-start justify-center p-4 pt-[12vh] bg-slate-900/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden font-display"
                    >
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                            <Search className="w-5 h-5 text-slate-400" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setActiveIndex(0);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Search pages and actions..."
                                className="flex-1 bg-transparent text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
                            />
                            <kbd className="hidden sm:inline-flex text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-600 rounded-md px-1.5 py-0.5">
                                ESC
                            </kbd>
                        </div>

                        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
                            {results.length === 0 ? (
                                <div className="px-5 py-10 text-center">
                                    <p className="text-sm font-bold text-slate-400">No results for “{query}”</p>
                                </div>
                            ) : (
                                <>
                                    {showRecentsHeader && (
                                        <div className="px-5 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" /> Recent
                                        </div>
                                    )}
                                    {results.map((item, index) => {
                                        const Icon = item.icon;
                                        const isActive = index === safeActiveIndex;
                                        const isRecentRow = showRecentsHeader && index < recents.length;
                                        const isFirstAllRow = showRecentsHeader && index === recents.length;
                                        return (
                                            <React.Fragment key={`${item.href}-${index}`}>
                                                {isFirstAllRow && (
                                                    <div className="px-5 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        All Pages
                                                    </div>
                                                )}
                                                <button
                                                    data-index={index}
                                                    onClick={() => navigate(item)}
                                                    onMouseEnter={() => setActiveIndex(index)}
                                                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${isActive
                                                        ? 'bg-brand-50 dark:bg-brand-900/20'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                                                        }`}
                                                >
                                                    {Icon ? (
                                                        <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                                                    ) : isRecentRow ? (
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                    ) : (
                                                        <span className="w-4 h-4" />
                                                    )}
                                                    <span className={`flex-1 text-sm font-semibold ${isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                                        {item.label}
                                                    </span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.group}</span>
                                                    {isActive && <ArrowRight className="w-4 h-4 text-brand-500" />}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}
                                </>
                            )}
                        </div>

                        <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-4 text-[10px] font-bold text-slate-400">
                            <span className="flex items-center gap-1"><kbd className="border border-slate-200 dark:border-slate-600 rounded px-1">↑</kbd><kbd className="border border-slate-200 dark:border-slate-600 rounded px-1">↓</kbd> navigate</span>
                            <span className="flex items-center gap-1"><kbd className="border border-slate-200 dark:border-slate-600 rounded px-1">↵</kbd> open</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
