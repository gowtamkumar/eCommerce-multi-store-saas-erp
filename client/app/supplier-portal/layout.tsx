'use client';

import { fetchAPI } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Briefcase,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  Menu,
  Shield,
  User,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function SupplierPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchAPI('/supplier-portal/me')
      .then((res) => {
        if (res.success && res.data) {
          setSupplier(res.data);
        } else {
          toast.error('Not authorized or no linked supplier profile found.');
          router.push('/login');
        }
      })
      .catch(() => {
        toast.error('Authentication required.');
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Supplier Portal...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/supplier-portal', icon: Home },
    { name: 'Purchase Orders', path: '/supplier-portal/purchase-orders', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-brand-500" />
          <div>
            <h1 className="font-black text-sm uppercase tracking-wider text-white">Supplier Portal</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">ERP Partner Terminal</p>
          </div>
        </div>

        {/* Profile Card */}
        {supplier && (
          <div className="p-4 mx-4 my-6 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-brand-400" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-black text-xs text-white truncate">{supplier.name}</h3>
                <p className="text-[9px] font-bold uppercase text-slate-400 mt-0.5 tracking-wider">{supplier.category}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  {item.name}
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'translate-x-0.5' : 'opacity-0'}`} />
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/login');
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-850 rounded-xl text-xs font-black transition-all"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-brand-500" />
          <h1 className="font-black text-xs uppercase tracking-wider text-white">Partner Portal</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-1.5 bg-slate-850 rounded-lg text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute top-0 bottom-0 left-0 w-72 bg-slate-900 shadow-2xl flex flex-col p-6 border-r border-slate-800"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-brand-500" />
                  <h1 className="font-black text-xs uppercase tracking-wider text-white">Supplier Portal</h1>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all ${
                        isActive
                          ? 'bg-brand-500 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-slate-850 pt-6">
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    router.push('/login');
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-850 rounded-xl text-xs font-black transition-all"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
