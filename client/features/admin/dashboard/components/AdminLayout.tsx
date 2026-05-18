'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { UserRole } from '@/lib/enums/user-role.enum';
import { navGroups } from '@/routes';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, LogOut, Menu, X, Shield, Search } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import AdminTopBar from './AdminTopBar';

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
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
    const { data: session, status }: any = useSession();

    const brandName = settings?.brandName || "Brand name";
    const logo = settings?.logo || "";

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login');
        } else if (status === 'authenticated') {
            const rawRole = session?.user?.role || '';
            const allowedRoles = [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR, UserRole.SUPPORT, UserRole.MARKETING, UserRole.SUPER_ADMIN];
            if (!allowedRoles.includes(rawRole)) {
                console.warn(`User role ${rawRole} is not authorized for admin access`);
                router.replace('/');
            }
        }
    }, [status, session, router]);

    // Filter nav groups based on user role and plan features
    const filteredNavGroups = useMemo(() => {
        const rawRole = session?.user?.role || '';
        const userRole = typeof rawRole === 'string' ? rawRole.toLowerCase() : '';
        const features = session?.user?.features || [];
        const isSuperAdmin = userRole === UserRole.SUPER_ADMIN || features.includes('*');

        const initialGroups = navGroups
            .filter(group => {
                if ((group as any).roles) {
                    return (group as any).roles.map((r: string) => r.toLowerCase()).includes(userRole) || isSuperAdmin;
                }
                return true;
            })
            .map(group => ({
                ...group,
                items: group.items.filter((item: any) => {
                    // 1. Role Check
                    const hasRole = item.roles 
                        ? item.roles.map((r: string) => r.toLowerCase()).includes(userRole) || isSuperAdmin
                        : true;
                    
                    if (!hasRole) return false;

                    // 2. Feature Check (Plan Based)
                    if (isSuperAdmin) return true;
                    if (item.feature) {
                        return features.includes(item.feature);
                    }
                    
                    return true;
                })
            }))
            .filter(group => group.items.length > 0);

        if (!sidebarSearchQuery.trim()) {
            return initialGroups;
        }

        const query = sidebarSearchQuery.toLowerCase();
        return initialGroups
            .map(group => ({
                ...group,
                items: group.items.filter((item: any) => 
                    item.label?.toLowerCase().includes(query)
                )
            }))
            .filter(group => group.items.length > 0);
    }, [session?.user?.role, session?.user?.features, sidebarSearchQuery]);

    useEffect(() => {
        // Find which group contains the current pathname
        const activeGroup = filteredNavGroups.find(group =>
            group.items.some((item: any) => {
                if (!item.href) return false;
                const isMatch = item.href.includes('?')
                    ? pathname === item.href.split('?')[0] && searchParams.get('tab') === new URLSearchParams(item.href.split('?')[1]).get('tab')
                    : pathname === item.href;
                return isMatch;
            })
        );

        if (activeGroup) {
            setExpandedGroups(prev => new Set(prev).add(activeGroup.title));
        }

        // Auto-collapse sidebar when in Page Builder or POS register
        if ((pathname?.startsWith('/admin/pages/') && pathname.split('/').length > 3) || pathname === '/admin/pos') {
            setIsSidebarCollapsed(true);
        }
    }, [pathname, searchParams, filteredNavGroups]);

    const toggleGroup = (title: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(title)) {
                next.delete(title);
            } else {
                next.add(title);
            }
            return next;
        });
    };

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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl border border-amber-200 dark:border-amber-900/50 max-w-lg text-center"
                    >
                        <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative">
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
                        ${isSidebarCollapsed ? 'md:w-20' : 'md:w-72'}
                        `}
            >
                <div className={`p-6 border-b border-slate-200 dark:border-slate-700 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isSidebarCollapsed && (
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
                    {isSidebarCollapsed && logo && (
                        <Link href="/">
                            <img src={logo} alt={brandName} className="h-8 w-auto object-contain" />
                        </Link>
                    )}
                    {isSidebarCollapsed && !logo && (
                        <Link href="/">
                            <h1 className="text-xl font-bold font-display text-brand-600">
                                {brandName.substring(0, 1)}
                            </h1>
                        </Link>
                    )}

                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden md:flex text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </button>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Sidebar Quick Navigation Search */}
                <div className="px-4 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={isSidebarCollapsed ? "Search" : "Search navigation..."}
                            value={sidebarSearchQuery}
                            onChange={(e) => setSidebarSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                        />
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                    {filteredNavGroups.map((group, groupIndex) => {
                        const isExpanded = expandedGroups.has(group.title) || sidebarSearchQuery.trim().length > 0;
                        const hasActive = group.items.some((item: any) => {
                            if (!item.href) return false;
                            const isMatch = item.href.includes('?')
                                ? pathname === item.href.split('?')[0] && searchParams.get('tab') === new URLSearchParams(item.href.split('?')[1]).get('tab')
                                : pathname === item.href;
                            return isMatch;
                        });

                        return (
                            <div key={groupIndex} className="space-y-1">
                                {!isSidebarCollapsed && (
                                    <button
                                        onClick={() => toggleGroup(group.title)}
                                        className="w-full flex items-center justify-between px-4 py-2  font-semibold text-slate-400 transition-colors group"
                                    >
                                        <span>{group.title}</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} ${hasActive ? 'text-brand-500' : ''}`} />
                                    </button>
                                )}

                                <AnimatePresence initial={false}>
                                    {(isExpanded || isSidebarCollapsed) && (
                                        <motion.div
                                            initial={isSidebarCollapsed ? undefined : { height: 0, opacity: 0 }}
                                            animate={isSidebarCollapsed ? undefined : { height: 'auto', opacity: 1 }}
                                            exit={isSidebarCollapsed ? undefined : { height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                            className="overflow-hidden space-y-1"
                                        >
                                            {group.items.map((item: any, index) => {
                                                if (item.type === 'header') {
                                                    return !isSidebarCollapsed && (
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

                                                const isActive = item.href.includes('?')
                                                    ? pathname === item.href.split('?')[0] && searchParams.get('tab') === new URLSearchParams(item.href.split('?')[1]).get('tab')
                                                    : pathname === item.href;
                                                return (
                                                    <Link
                                                        key={`${groupIndex}-${index}`}
                                                        href={item.href}
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        title={isSidebarCollapsed ? item.label : ''}
                                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive
                                                            ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold'
                                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                                                            } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                                                    >
                                                        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                                                        {!isSidebarCollapsed && <span>{item.label}</span>}
                                                    </Link>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    {!isSidebarCollapsed && (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-medium"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    )}
                    {isSidebarCollapsed && (
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-medium"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}
                </div>
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
                    {children}
                </div>
            </main>
        </div>
    );
}
