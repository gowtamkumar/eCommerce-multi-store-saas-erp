'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { navGroups, settingsItems } from '@/routes';
import { AnimatePresence, motion } from 'framer-motion';
import { Banknote, BarChart3, ChevronDown, ChevronLeft, ChevronRight, CreditCard, Download, FileText, Globe, HelpCircle, History as HistoryIcon, Layout, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Package, Receipt, RotateCcw, Settings, Share2, ShoppingBag, ShoppingCart, Star, Tag, TrendingUp, Truck, User, Users, X, Megaphone, Wallet } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

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
    const { data: session, status }: any = useSession();

    const isFullScreenPos = pathname === '/admin/pos';

    const brandName = settings?.brandName || "Brand name";
    const logo = settings?.logo || "";


    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login');
        } else if (status === 'authenticated') {
            const role = session?.user?.role;
            const allowedRoles = ['Admin', 'Operator', 'SuperAdmin'];
            if (!allowedRoles.includes(role)) {
                console.warn(`User role ${role} is not authorized for admin access`);
                router.replace('/');
            }
        }
    }, [status, session, router]);

    // Filter nav groups based on user role
    const filteredNavGroups = useMemo(() => {
        return navGroups.filter(group => {
            const userRole = session?.user?.role;
            if ((group as any).roles) {
                return (group as any).roles.includes(userRole) || userRole === 'SuperAdmin';
            }
            return true;
        });
    }, [session?.user?.role]);

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

        // Auto-collapse sidebar when in Page Builder
        if (pathname?.startsWith('/admin/pages/') && pathname.split('/').length > 3) {
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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
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
            {!isFullScreenPos && (
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

                <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                    {filteredNavGroups.map((group, groupIndex) => {
                        const isExpanded = expandedGroups.has(group.title);
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
            )}

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Mobile Header */}
                {!isFullScreenPos && (
                    <div className="md:hidden p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 z-30 print:hidden">
                    <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        {logo ? (
                            <img src={logo} alt={brandName} className="h-8 w-auto object-contain" />
                        ) : (
                            <>
                                {brandName.substring(0, 4)}<span className="text-brand-600">{brandName.substring(4)}</span>
                            </>
                        )}
                    </h1>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
                )}

                <div className={isFullScreenPos ? "" : "p-4 md:p-8 max-w-full mx-auto"}>
                    {children}
                </div>
            </main>
        </div>
    );
}
