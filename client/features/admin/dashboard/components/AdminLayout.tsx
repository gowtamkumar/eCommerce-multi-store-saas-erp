'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { UserRole } from '@/lib/enums/user-role.enum';
import { decodeJwtPayload } from '@/lib/jwt.util';
import { navGroups } from '@/routes';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Search, Shield, Star, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ComponentType, useCallback, useEffect, useMemo, useState } from 'react';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import AdminTopBar from './AdminTopBar';
import CommandPalette, { recordRecentPage } from './CommandPalette';

const FAVORITES_KEY = 'admin:favorites';
const EXPANDED_GROUPS_KEY = 'admin:expandedGroups';
const SIDEBAR_COLLAPSED_KEY = 'admin:sidebarCollapsed';

type IconComponent = ComponentType<{ className?: string }>;

type AdminNavItem = {
    type?: string;
    icon?: IconComponent;
    label?: string;
    href?: string;
    feature?: string;
    roles?: string[];
};

type AdminNavGroup = {
    title: string;
    roles?: string[];
    items: AdminNavItem[];
};

type NavigableAdminNavItem = AdminNavItem & {
    href: string;
    label: string;
    icon: IconComponent;
};

type AdminSession = {
    user?: {
        role?: string;
        features?: string[];
        accessToken?: string;
    };
};

function readStoredJson<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function isNavigableItem(item: AdminNavItem | undefined): item is NavigableAdminNavItem {
    return Boolean(item?.href && item.label && item.icon);
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { settings } = useSettings();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
        () => new Set(readStoredJson<string[]>(EXPANDED_GROUPS_KEY, [])),
    );
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
        () => readStoredJson<boolean>(SIDEBAR_COLLAPSED_KEY, false),
    );
    const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);
    const [favorites, setFavorites] = useState<string[]>(
        () => readStoredJson<string[]>(FAVORITES_KEY, []),
    );
    const { data: session, status } = useSession() as {
        data: AdminSession | null;
        status: 'loading' | 'authenticated' | 'unauthenticated';
    };

    // Global ⌘K / Ctrl+K to open the command palette.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsPaletteOpen((o) => !o);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const toggleFavorite = useCallback((href: string) => {
        setFavorites((prev) => {
            const next = prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href];
            try {
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
            } catch {
                /* ignore persistence errors */
            }
            return next;
        });
    }, []);

    const brandName = settings?.brandName || "Brand name";
    const logo = settings?.logo || "";

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login');
        } else if (status === 'authenticated') {
            const rawRole = session?.user?.role || '';
            const allowedRoles: string[] = [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR, UserRole.SUPPORT, UserRole.MARKETING, UserRole.SUPER_ADMIN];
            if (!allowedRoles.includes(rawRole)) {
                console.warn(`User role ${rawRole} is not authorized for admin access`);
                router.replace('/');
            }
        }
    }, [status, session, router]);

    // Nav groups filtered by user role and plan features (search-independent).
    const roleFilteredNavGroups = useMemo(() => {
        const rawRole = session?.user?.role || '';
        const userRole = typeof rawRole === 'string' ? rawRole.toLowerCase() : '';
        const sessionFeatures = session?.user?.features || [];
        const tokenFeatures = decodeJwtPayload<{ features?: string[] }>(
            session?.user?.accessToken,
        )?.features;
        const features =
            sessionFeatures.length > 0
                ? sessionFeatures
                : Array.isArray(tokenFeatures)
                  ? tokenFeatures
                  : [];
        const isSuperAdmin = userRole === UserRole.SUPER_ADMIN || features.includes('*');
        const hasFeatureAccess = (feature?: string) => {
            if (!feature) return true;
            if (isSuperAdmin) return true;
            // If plan features are unavailable (refresh/lookup issues), keep role-based nav visible.
            if (features.length === 0) return true;
            return features.includes(feature);
        };

        return (navGroups as AdminNavGroup[])
            .filter(group => {
                if (group.roles) {
                    return group.roles.map((r) => r.toLowerCase()).includes(userRole) || isSuperAdmin;
                }
                return true;
            })
            .map(group => ({
                ...group,
                items: group.items.filter((item) => {
                    const hasRole = item.roles
                        ? item.roles.map((r: string) => r.toLowerCase()).includes(userRole) || isSuperAdmin
                        : true;

                    if (!hasRole) return false;
                    return hasFeatureAccess(item.feature);
                })
            }))
            .filter(group => group.items.length > 0);
    }, [session?.user?.role, session?.user?.features, session?.user?.accessToken]);

    // Expand all groups by default so the sidebar is never blank on first visit.
    useEffect(() => {
        if (roleFilteredNavGroups.length === 0) return;
        const validTitles = new Set(roleFilteredNavGroups.map((group) => group.title));
        setExpandedGroups((prev) => {
            const hasValidExpansion = Array.from(prev).some((title) => validTitles.has(title));
            if (hasValidExpansion) return prev;
            return validTitles;
        });
    }, [roleFilteredNavGroups]);

    // Apply the sidebar search box on top of the role-filtered groups.
    const filteredNavGroups = useMemo(() => {
        if (!sidebarSearchQuery.trim()) {
            return roleFilteredNavGroups;
        }
        const query = sidebarSearchQuery.toLowerCase();
        return roleFilteredNavGroups
            .map(group => ({
                ...group,
                items: group.items.filter((item) =>
                    item.label?.toLowerCase().includes(query)
                )
            }))
            .filter(group => group.items.length > 0);
    }, [roleFilteredNavGroups, sidebarSearchQuery]);

    // Resolve favorite hrefs against the (role-filtered) nav so labels/icons stay correct.
    const favoriteItems = useMemo(() => {
        if (favorites.length === 0) return [];
        const all: AdminNavItem[] = [];
        for (const group of roleFilteredNavGroups) {
            for (const item of group.items) {
                if (item.type === 'header' || !item.href) continue;
                all.push(item);
            }
        }
        return favorites
            .map((href) => all.find((i) => i.href === href))
            .filter(isNavigableItem);
    }, [favorites, roleFilteredNavGroups]);

    const activeGroupTitle = useMemo(() => {
        const activeGroup = filteredNavGroups.find(group =>
            group.items.some((item) => {
                if (!item.href) return false;
                const isMatch = item.href.includes('?')
                    ? pathname === item.href.split('?')[0] && searchParams.get('tab') === new URLSearchParams(item.href.split('?')[1]).get('tab')
                    : pathname === item.href;
                return isMatch;
            })
        );
        return activeGroup?.title;
    }, [pathname, searchParams, filteredNavGroups]);

    const isAutoCollapsedRoute = Boolean(
        (pathname?.startsWith('/admin/pages/') && pathname.split('/').length > 3) || pathname === '/admin/pos',
    );
    const sidebarCollapsed = isSidebarCollapsed || isAutoCollapsedRoute;

    const toggleGroup = (title: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(title)) {
                next.delete(title);
            } else {
                next.add(title);
            }
            try {
                localStorage.setItem(EXPANDED_GROUPS_KEY, JSON.stringify(Array.from(next)));
            } catch {
                /* ignore persistence errors */
            }
            return next;
        });
    };

    const toggleSidebarCollapsed = () => {
        setIsSidebarCollapsed(prev => {
            const next = !prev;
            try {
                localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
            } catch {
                /* ignore persistence errors */
            }
            return next;
        });
    };

    // Record visited admin pages so the command palette can surface recents.
    useEffect(() => {
        if (!pathname || pathname === '/admin') return;
        for (const group of roleFilteredNavGroups) {
            const match = group.items.find(
                (i) => i.href && i.href.split('?')[0] === pathname,
            );
            if (isNavigableItem(match)) {
                recordRecentPage({ href: match.href, label: match.label, group: group.title });
                break;
            }
        }
    }, [pathname, roleFilteredNavGroups]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    if (!session) {
        return null;
    }




    const handleLogout = async () => {
        await signOut({ callbackUrl: `${window.location.origin}/login` });
    };

    const isSubscriptionExpired = settings?.status === 'expired' && session?.user?.role !== UserRole.SUPER_ADMIN;
    const isOnBillingPage = pathname?.startsWith('/admin/settings/billing');
    const showExpirationOverlay = isSubscriptionExpired && !isOnBillingPage;
    const isPosRoute = pathname === '/admin/pos';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
            {/* Expiration Overlay */}
            {showExpirationOverlay && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl border border-amber-200 dark:border-amber-900/50 max-w-lg text-center"
                    >
                        <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-4xl flex items-center justify-center mx-auto mb-8 relative">
                            <Shield className="w-12 h-12 text-amber-500" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full animate-ping" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Plan Expired</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
                            Your store subscription has expired. Storefront access is currently locked and management features are restricted until renewal.
                        </p>
                        <div className="flex flex-col gap-4">
                            <Link
                                href="/admin/settings/billing"
                                className="py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-500/20 active:scale-95 text-center flex items-center justify-center"
                            >
                                Renew Subscription
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="py-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold tracking-wide transition-all"
                            >
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ease-in-out print:hidden 
                        ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
                        ${sidebarCollapsed ? 'md:w-20' : 'md:w-72'}
                        `}
            >
                <div className={`p-6 border-b border-slate-200 dark:border-slate-700 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!sidebarCollapsed && (
                        <Link href="/">
                            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-3 overflow-hidden whitespace-nowrap">
                                {logo ? (
                                    <img src={logo} alt={brandName} className="h-10 w-auto object-contain" />
                                ) : (
                                    <>
                                        {brandName.substring(0, 4)}<span className="text-brand-600">{brandName.substring(4)}</span>
                                    </>
                                )}
                            </h1>
                        </Link>
                    )}
                    {sidebarCollapsed && logo && (
                        <Link href="/">
                            <img src={logo} alt={brandName} className="h-8 w-auto object-contain" />
                        </Link>
                    )}
                    {sidebarCollapsed && !logo && (
                        <Link href="/">
                            <h1 className="text-xl font-bold font-display text-brand-600">
                                {brandName.substring(0, 1)}
                            </h1>
                        </Link>
                    )}

                    <div className="flex items-center">
                        <button
                            onClick={toggleSidebarCollapsed}
                            className="hidden md:flex text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </button>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Sidebar Quick Navigation Search */}
                <div className="px-4 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                    {sidebarCollapsed ? (
                        <button
                            onClick={() => setIsPaletteOpen(true)}
                            title="Search (⌘K)"
                            className="w-full flex items-center justify-center py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-slate-400 hover:text-brand-600 transition-all"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search navigation..."
                                value={sidebarSearchQuery}
                                onChange={(e) => setSidebarSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-12 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                            />
                            <button
                                type="button"
                                onClick={() => setIsPaletteOpen(true)}
                                title="Open command palette"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-600 rounded-md px-1.5 py-0.5 hover:text-brand-600 hover:border-brand-400 transition-colors"
                            >
                                ⌘K
                            </button>
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                    {/* Favorites / pinned pages */}
                    {!sidebarCollapsed && !sidebarSearchQuery.trim() && favoriteItems.length > 0 && (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 px-4 py-2 font-semibold text-slate-400">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>Favorites</span>
                            </div>
                            {favoriteItems.map((item, index) => {
                                const FavoriteIcon = item.icon;
                                const itemHref = item.href;
                                const isActive = pathname === item.href.split('?')[0];
                                return (
                                    <div key={`fav-${index}`} className="group/fav relative">
                                        <Link
                                            href={itemHref}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-2.5 pr-9 rounded-xl transition-all ${isActive
                                                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <FavoriteIcon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                                            <span>{item.label}</span>
                                        </Link>
                                        <button
                                            onClick={() => toggleFavorite(itemHref)}
                                            title="Remove from favorites"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-500 transition-colors"
                                        >
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {filteredNavGroups.map((group, groupIndex) => {
                        const isExpanded = expandedGroups.has(group.title) || activeGroupTitle === group.title || sidebarSearchQuery.trim().length > 0;
                        const hasActive = group.items.some((item) => {
                            if (!item.href) return false;
                            const isMatch = item.href.includes('?')
                                ? pathname === item.href.split('?')[0] && searchParams.get('tab') === new URLSearchParams(item.href.split('?')[1]).get('tab')
                                : pathname === item.href;
                            return isMatch;
                        });

                        return (
                            <div key={groupIndex} className="space-y-1">
                                {!sidebarCollapsed && (
                                    <button
                                        onClick={() => toggleGroup(group.title)}
                                        className="w-full flex items-center justify-between px-4 py-2  font-semibold text-slate-400 transition-colors group"
                                    >
                                        <span>{group.title}</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} ${hasActive ? 'text-brand-500' : ''}`} />
                                    </button>
                                )}

                                <AnimatePresence initial={false}>
                                    {(isExpanded || sidebarCollapsed) && (
                                        <motion.div
                                            initial={sidebarCollapsed ? undefined : { height: 0, opacity: 0 }}
                                            animate={sidebarCollapsed ? undefined : { height: 'auto', opacity: 1 }}
                                            exit={sidebarCollapsed ? undefined : { height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                            className="overflow-hidden space-y-1"
                                        >
                                            {group.items.map((item, index) => {
                                                if (item.type === 'header') {
                                                    return !sidebarCollapsed && (
                                                        <div
                                                            key={`${groupIndex}-${index}`}
                                                            className={`flex items-center gap-2 px-4 ${index !== 0 ? 'mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50' : 'mt-2'}`}
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500/50" />
                                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                if (!item.href || !item.icon) return null;
                                                const ItemIcon = item.icon;
                                                const itemHref = item.href;
                                                const isActive = item.href.includes('?')
                                                    ? pathname === item.href.split('?')[0] && searchParams.get('tab') === new URLSearchParams(item.href.split('?')[1]).get('tab')
                                                    : pathname === item.href;
                                                const isFavorite = favorites.includes(itemHref);
                                                return (
                                                    <div key={`${groupIndex}-${index}`} className="group/item relative">
                                                        <Link
                                                            href={itemHref}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            title={sidebarCollapsed ? item.label : ''}
                                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${!sidebarCollapsed ? 'pr-9' : ''} ${isActive
                                                                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold'
                                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                                                                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                                                        >
                                                            <ItemIcon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                                                            {!sidebarCollapsed && <span>{item.label}</span>}
                                                        </Link>
                                                        {!sidebarCollapsed && (
                                                            <button
                                                                onClick={() => toggleFavorite(itemHref)}
                                                                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                                                className={`absolute right-2 top-1/2 -translate-y-1/2 transition-all ${isFavorite
                                                                    ? 'text-amber-400 hover:text-amber-500'
                                                                    : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover/item:opacity-100 hover:text-amber-400'
                                                                    }`}
                                                            >
                                                                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>


            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col">
                {/* Premium Inner Dashboard Top Bar */}
                {!isPosRoute && (
                    <AdminTopBar
                        logo={logo}
                        brandName={brandName}
                        session={session}
                        onMenuClick={() => setIsMobileMenuOpen(true)}
                        onLogout={handleLogout}
                    />
                )}

                <div className={isPosRoute ? "p-4 md:p-6 w-full min-h-screen flex-1" : "p-4 md:p-8 max-w-full mx-auto w-full flex-1"}>
                    {!isPosRoute && <AdminBreadcrumbs />}
                    {children}
                </div>
            </main>

            {/* Global command palette (⌘K) */}
            <CommandPalette
                open={isPaletteOpen}
                onClose={() => setIsPaletteOpen(false)}
                groups={roleFilteredNavGroups}
            />
        </div>
    );
}
