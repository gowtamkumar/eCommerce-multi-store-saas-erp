'use client';
import { motion } from 'framer-motion';
import { Activity, Bell, CreditCard, Globe, Layers, LayoutDashboard, Mail, Megaphone, Settings, ShieldAlert, ShieldCheck, Users, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export default function SystemSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: { isMobileMenuOpen: boolean; setIsMobileMenuOpen: (open: boolean) => void }) {
    const pathname = usePathname();
    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/system' },
        { icon: Globe, label: 'Tenants (Stores)', href: '/system/tenants' },
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
        { icon: Settings, label: 'Global Settings', href: '/system/settings' },
    ];



    return (
        <motion.aside
            className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
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
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>


        </motion.aside>
    );
}