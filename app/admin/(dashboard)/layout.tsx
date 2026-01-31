'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Banknote, BarChart3, ChevronDown, CreditCard, FileText, Globe, Layout, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Package, Settings, Share2, ShoppingBag, Tag, TrendingUp, User, Users, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = useSettings();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(pathname?.startsWith('/admin/settings'));
  const { data: session, status }: any = useSession();

  const brandName = settings?.brandName || "Brand name";
  const logo = settings?.logo || "";


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'Admin') {
      console.warn("User is not an admin, redirecting to home");
      router.replace('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (pathname?.startsWith('/admin/settings')) {
      setIsSettingsOpen(true);
    }
  }, [pathname]);

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

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: Menu, label: 'Navbar', href: '/admin/pages' },
    { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: Tag, label: 'Categories', href: '/admin/categories' },
    { icon: Users, label: 'Customers', href: '/admin/customers' },
    { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
    { icon: FileText, label: 'Pages', href: '/admin/pages' },
    { icon: MessageSquare, label: 'Lead', href: '/admin/leads' },
    { icon: User, label: 'Media', href: '/admin/media' },
  ];

  const settingsItems = [
    { icon: Globe, label: 'General Info', tab: 'general' },
    { icon: Globe, label: 'Custom Domain', tab: 'domain' },
    { icon: Mail, label: 'Email Settings', tab: 'email' },
    { icon: CreditCard, label: 'Payment Credentials', tab: 'payment' },
    { icon: Banknote, label: 'Localization', tab: 'currencies' },
    { icon: Share2, label: 'Social Links', tab: 'social' },
    { icon: TrendingUp, label: 'Marketing & SEO', tab: 'marketing' },
    { icon: Menu, label: 'Navbar Menu', tab: 'navbar' },
    { icon: Layout, label: 'Footer Menu', tab: 'footer' },
  ];


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
      <motion.aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300 ease-in-out print:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-3">
            {logo ? (
              <img src={logo} alt={brandName} className="h-10 w-auto object-contain" />
            ) : (
              <>
                {brandName.substring(0, 4)}<span className="text-brand-600">{brandName.substring(4)}</span>
              </>
            )}
          </h1>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={index}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-1">
          {/* Collapsible Settings */}
          <div className="space-y-1">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname?.startsWith('/admin/settings')
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                Settings
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden pl-4 space-y-1"
                >
                  {settingsItems.map((item, index) => {
                    const isActive = pathname === '/admin/settings';
                    return (
                      <Link
                        key={index}
                        href={`/admin/settings?tab=${item.tab}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${isActive
                          ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-900/10 font-medium'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                          }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
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

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
