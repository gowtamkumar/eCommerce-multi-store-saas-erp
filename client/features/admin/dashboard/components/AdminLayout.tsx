'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useRequirePermission } from '@/hooks/useRequirePermission';
import { UserRole } from '@/lib/enums/user-role.enum';
import { decodeJwtPayload } from '@/lib/jwt.util';
import { canAccessNavItem, getEffectiveFeatures, isStaffRole, resolveNavItemFeature } from '@/lib/permissions';
import { navGroups, type AdminNavGroup, type AdminNavItem } from '@/routes';
import { fetchAPI } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Search, Shield, Star, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ComponentType, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import AdminTopBar from './AdminTopBar';
import CommandPalette, { recordRecentPage } from './CommandPalette';
import GlobalCopilotSidebar from './dashboard/GlobalCopilotSidebar';

const FAVORITES_KEY = 'admin:favorites';
const EXPANDED_GROUPS_KEY = 'admin:expandedGroups';
const SIDEBAR_COLLAPSED_KEY = 'admin:sidebarCollapsed';

type IconComponent = ComponentType<{ className?: string }>;

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
    const [isCopilotOpen, setIsCopilotOpen] = useState(false);
    const { data: session, status, update } = useSession() as {
        data: AdminSession | null;
        status: 'loading' | 'authenticated' | 'unauthenticated';
        update: (data?: Record<string, unknown>) => Promise<unknown>;
    };

    const { manifest, isSuperAdmin, isFullAccess, canAccessRoute, firstAccessibleRoute } = usePermissions();
    useRequirePermission();

    const [subInfo, setSubInfo] = useState<{ status: string; isExpired: boolean } | null>(null);
    const [isAlertDismissed, setIsAlertDismissed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return sessionStorage.getItem('admin:subscriptionAlertDismissed') === 'true';
    });

    const hasFetchedMe = useRef(false);

    useEffect(() => {
        if (status !== 'authenticated' || hasFetchedMe.current) return;
        hasFetchedMe.current = true;

        fetchAPI('/auth/me')
            .then((res) => {
                if (res?.success && res?.data?.permissionManifest) {
                    const newManifest = res.data.permissionManifest;
                    const currentStr = JSON.stringify(manifest || null);
                    const newStr = JSON.stringify(newManifest);
                    if (currentStr !== newStr) {
                        void update({
                            permissionManifest: newManifest,
                            features:
                                res.data.user?.features ??
                                newManifest?.featuresEnabled,
                        });
                    }
                }
            })
            .catch(() => {
                /* manifest refresh is best-effort */
            });
    }, [status, manifest, update]);

    useEffect(() => {
        if (status !== 'authenticated' || isSuperAdmin || !manifest?.permissions?.length) return;
        if (pathname === '/admin' && !canAccessRoute('/admin') && firstAccessibleRoute !== '/admin') {
            router.replace(firstAccessibleRoute);
        }
    }, [status, pathname, manifest, isSuperAdmin, canAccessRoute, firstAccessibleRoute, router]);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== UserRole.SUPER_ADMIN) {
            fetchAPI('/billing/current')
                .then((res) => {
                    if (res?.success && res?.data) {
                        setSubInfo(res.data);
                    }
                })
                .catch((err) => {
                    console.error('Failed to fetch subscription info', err);
                });
        }
    }, [status, session]);

    const isSubscriptionExpired = (settings?.status === 'expired' || subInfo?.isExpired === true) && session?.user?.role !== UserRole.SUPER_ADMIN;

    useEffect(() => {
        if (isSubscriptionExpired) {
            const isOnBillingPage = pathname?.startsWith('/admin/settings/billing');
            if (!isOnBillingPage) {
                router.replace('/admin/settings/billing');
            }
        }
    }, [isSubscriptionExpired, pathname, router]);

    const handleDismissAlert = () => {
        setIsAlertDismissed(true);
        sessionStorage.setItem('admin:subscriptionAlertDismissed', 'true');
    };

    const hasAiUse = useMemo(() => {
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
        return userRole === UserRole.SUPER_ADMIN || features.includes('*') || features.includes('ai:use');
    }, [session]);

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
            if (!isStaffRole(rawRole)) {
                router.replace('/');
            }
        }
    }, [status, session, router]);

    console.log("session", session);


    // Nav groups filtered by RBAC permissions + plan features (search-independent).
    const permissionFilteredNavGroups = useMemo(() => {
        const tokenFeatures = decodeJwtPayload<{ features?: string[] }>(
            session?.user?.accessToken,
        )?.features;
        const features = getEffectiveFeatures(
            manifest,
            session?.user?.features || [],
            Array.isArray(tokenFeatures) ? tokenFeatures : [],
        );
        const hasFeatureAccess = (feature?: string, item?: AdminNavItem) => {
            if (!feature && item) {
                feature = resolveNavItemFeature(item);
            }
            if (!feature) return true;
            if (manifest?.featuresEnabled?.length) {
                return manifest.featuresEnabled.includes(feature);
            }
            if (features.length === 0) return true;
            return features.includes(feature);
        };

        const accessOptions = { isSuperAdmin, isFullAccess };

        return (navGroups as AdminNavGroup[])
            .map((group) => ({
                ...group,
                items: group.items.filter((item) => {
                    if (item.type === 'header') return true;
                    if (!hasFeatureAccess(item.feature, item)) return false;
                    if (!manifest && !isSuperAdmin) return false;
                    return canAccessNavItem(manifest, item, accessOptions);
                }),
            }))
            .map((group) => ({
                ...group,
                items: group.items.filter((item) => item.type === 'header' || item.href),
            }))
            .filter((group) => group.items.some((item) => item.href));
    }, [
        session?.user?.features,
        session?.user?.accessToken,
        manifest,
        isSuperAdmin,
        isFullAccess,
    ]);

    // Expand all groups by default so the sidebar is never blank on first visit.
    useEffect(() => {
        if (permissionFilteredNavGroups.length === 0) return;
        const validTitles = new Set(permissionFilteredNavGroups.map((group) => group.title));
        setExpandedGroups((prev) => {
            const hasValidExpansion = Array.from(prev).some((title) => validTitles.has(title));
            if (hasValidExpansion) return prev;
            return validTitles;
        });
    }, [permissionFilteredNavGroups]);

    // Apply the sidebar search box on top of the role-filtered groups.
    const filteredNavGroups = useMemo(() => {
        if (!sidebarSearchQuery.trim()) {
            return permissionFilteredNavGroups;
        }
        const query = sidebarSearchQuery.toLowerCase();
        return permissionFilteredNavGroups
            .map(group => ({
                ...group,
                items: group.items.filter((item) =>
                    item.label?.toLowerCase().includes(query)
                )
            }))
            .filter(group => group.items.length > 0);
    }, [permissionFilteredNavGroups, sidebarSearchQuery]);

    // Resolve favorite hrefs against the (role-filtered) nav so labels/icons stay correct.
    const favoriteItems = useMemo(() => {
        if (favorites.length === 0) return [];
        const all: AdminNavItem[] = [];
        for (const group of permissionFilteredNavGroups) {
            for (const item of group.items) {
                if (item.type === 'header' || !item.href) continue;
                all.push(item);
            }
        }
        return favorites
            .map((href) => all.find((i) => i.href === href))
            .filter(isNavigableItem);
    }, [favorites, permissionFilteredNavGroups]);

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
        for (const group of permissionFilteredNavGroups) {
            const match = group.items.find(
                (i) => i.href && i.href.split('?')[0] === pathname,
            );
            if (isNavigableItem(match)) {
                recordRecentPage({ href: match.href, label: match.label, group: group.title });
                break;
            }
        }
    }, [pathname, permissionFilteredNavGroups]);

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

    const showAlert = isSubscriptionExpired && !isAlertDismissed;
    const isPosRoute = pathname === '/admin/pos';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            {/* Topbar Alert */}
            {showAlert && (
                <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-4 py-3 text-center relative flex items-center justify-center gap-3 shadow-md z-[100] animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold min-w-0">
                        <Shield className="w-4 h-4 shrink-0 animate-pulse" />
                        <span className="truncate">
                            {subInfo?.status === 'trial'
                                ? 'Your 14-day trial period has ended. Please upgrade your plan to continue using the store.'
                                : 'Your subscription has expired. Please renew to continue using the store.'}
                        </span>
                        <Link
                            href="/admin/settings/billing"
                            className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-[11px] font-black uppercase tracking-wider rounded-lg transition-all whitespace-nowrap"
                        >
                            Upgrade Plan
                        </Link>
                    </div>
                    <button
                        onClick={handleDismissAlert}
                        className="absolute right-4 p-1 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                        aria-label="Dismiss alert"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="flex-1 flex">

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
                            onCopilotClick={hasAiUse ? () => setIsCopilotOpen(!isCopilotOpen) : undefined}
                        />
                    )}

                    <div className={isPosRoute ? "p-4 md:p-6 w-full min-h-screen flex-1" : "p-4 md:p-8 max-w-full mx-auto w-full flex-1"}>
                        {!isPosRoute && <AdminBreadcrumbs />}
                        {children}
                    </div>
                </main>
            </div>

            {/* Global command palette (⌘K) */}
            <CommandPalette
                open={isPaletteOpen}
                onClose={() => setIsPaletteOpen(false)}
                groups={permissionFilteredNavGroups}
            />

            {/* Global copilot sidebar */}
            <GlobalCopilotSidebar
                isOpen={isCopilotOpen}
                onClose={() => setIsCopilotOpen(false)}
            />
        </div>
    );
}
