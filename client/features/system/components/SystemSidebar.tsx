'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
    Activity, Bell, CreditCard, Globe, Layers, LayoutDashboard, Mail, Megaphone, 
    Settings, ShieldAlert, ShieldCheck, Shield, Users, X, Zap, ChevronDown, 
    Layout, Search, MessageSquare, Bot, Database 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SystemSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: { isMobileMenuOpen: boolean; setIsMobileMenuOpen: (open: boolean) => void }) {
    const pathname = usePathname();
    const [isSettingsOpen, setIsSettingsOpen] = useState(pathname.startsWith('/system/settings'));
    const [prevPathname, setPrevPathname] = useState(pathname);

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/system' },
        { icon: Globe, label: 'Stores', href: '/system/tenants' },
        { icon: Users, label: 'Global Users', href: '/system/users' },
        { icon: Activity, label: 'Platform Health', href: '/system/health' },
        { icon: Bell, label: 'Platform Alerts', href: '/system/notifications' },
        { icon: ShieldCheck, label: 'Platform Audit Logs', href: '/system/audit-logs' },
        { icon: Layers, label: 'Subscription Plans', href: '/system/plans' },
        { icon: Zap, label: 'Addon Catalog', href: '/system/addons' },
        { icon: Mail, label: 'Subscribers', href: '/system/subscribers' },
        { icon: Megaphone, label: 'Campaigns', href: '/system/campaigns' },
        { icon: CreditCard, label: 'Billing & Revenue', href: '/system/billing' },
        { icon: ShieldAlert, label: 'Security', href: '/system/security' },
    ];

    const settingsSubItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/system/settings/dashboard' },
        { id: 'identity', label: 'Identity', icon: Globe, href: '/system/settings/identity' },
        { id: 'hero', label: 'Hero Section', icon: Layout, href: '/system/settings/hero' },
        { id: 'features', label: 'Features', icon: Zap, href: '/system/settings/features' },
        { id: 'footer', label: 'Footer', icon: Shield, href: '/system/settings/footer' },
        { id: 'seo', label: 'SEO & Meta', icon: Search, href: '/system/settings/seo' },
        { id: 'smtp', label: 'SMTP Config', icon: Mail, href: '/system/settings/smtp' },
        { id: 'sms', label: 'SMS Config', icon: MessageSquare, href: '/system/settings/sms' },
        { id: 'ai', label: 'AI', icon: Bot, href: '/system/settings/ai' },
        { id: 'system', label: 'System & Cache', icon: Database, href: '/system/settings/system' },
    ];

    useEffect(() => {
        const wasSettings = prevPathname.startsWith('/system/settings');
        const isSettings = pathname.startsWith('/system/settings');
        
        if (!isSettings) {
            setIsSettingsOpen(false);
        } else if (!wasSettings) {
            setIsSettingsOpen(true);
        }
        setPrevPathname(pathname);
    }, [pathname, prevPathname]);

    const isSettingsActive = pathname.startsWith('/system/settings');

    return (
        <motion.aside
            className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
        >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold font-display">
                        Super<span className="text-indigo-400">Panel</span>
                    </h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                isActive
                                    ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-550'}`} />
                            {item.label}
                        </Link>
                    );
                })}

                {/* Global Settings Section */}
                <div className="space-y-1">
                    <Link
                        href="/system/settings/dashboard"
                        onClick={() => {
                            setIsSettingsOpen(!isSettingsOpen);
                            setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                            isSettingsActive
                                ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Settings className={`w-5 h-5 ${isSettingsActive ? 'text-white' : 'text-slate-500'}`} />
                            <span>Global Settings</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSettingsOpen ? 'rotate-0' : '-rotate-90'}`} />
                    </Link>
                    
                    {isSettingsOpen && (
                        <div className="mt-1 pl-4 space-y-1">
                            {settingsSubItems.map((subItem) => {
                                const isSubActive = pathname === subItem.href || (pathname === '/system/settings' && subItem.id === 'dashboard');
                                return (
                                    <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-sm ${
                                            isSubActive
                                                ? 'bg-slate-800 text-white font-semibold'
                                                : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                                        }`}
                                    >
                                        <subItem.icon className={`w-4 h-4 ${isSubActive ? 'text-white' : 'text-slate-500'}`} />
                                        <span>{subItem.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </nav>
        </motion.aside>
    );
}