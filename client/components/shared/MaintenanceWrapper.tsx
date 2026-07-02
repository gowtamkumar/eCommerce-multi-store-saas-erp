'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Wrench, ShieldAlert, ArrowRight, Cog } from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@/lib/enums/user-role.enum';
import { fetchAPI } from '@/services/api';

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

export default function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState('LuxeSaaS Enterprise');
  const pathname = usePathname();
  const { data: session, status } = useSession() as any;

  useEffect(() => {
    // Determine if the current path is bypassed
    const isBypassedPath =
      pathname.startsWith('/login') ||
      pathname.startsWith('/system') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/accept-invitation');

    if (isBypassedPath) {
      setIsMaintenance(false);
      setLoading(false);
      return;
    }

    const checkMaintenance = async () => {
      try {
        const res = await fetchAPI('/platform/settings');
        if (res?.success && res?.data) {
          setIsMaintenance(!!res.data.isMaintenanceMode);
          setMessage(res.data.maintenanceMessage || 'Platform is currently undergoing scheduled upgrades. Please try again shortly.');
          if (res.data.brandName) {
            setBrandName(res.data.brandName);
          }
        }
      } catch (err) {
        console.error('Error fetching maintenance settings:', err);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
  }, [pathname]);

  const isSuperAdmin = session?.user?.role === UserRole.SUPER_ADMIN;

  // If checking status, show a subtle loading spinner to prevent UI flashing
  if (loading && !isMaintenance) {
    const isBypassedPath =
      pathname.startsWith('/login') ||
      pathname.startsWith('/system') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/accept-invitation');

    if (!isBypassedPath) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="relative flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <Cog className="absolute w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
        </div>
      );
    }
  }

  // Block display and show maintenance screen if active and user is not Super Admin
  if (isMaintenance && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Abstract glowing background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative z-10 space-y-8 text-center"
        >
          {/* Animated Gear & Wrench Icon */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="absolute inset-0 text-slate-800"
            >
              <Cog className="w-full h-full" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute w-12 h-12 text-indigo-500/80"
            >
              <Cog className="w-full h-full" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute z-10 text-amber-500"
            >
              <Wrench className="w-8 h-8" />
            </motion.div>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-widest rounded-full">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Scheduled Maintenance</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight font-display">
              We'll Be Right Back
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md mx-auto">
              Our engineering team is executing scheduled platform upgrades to optimize checkout speeds and synchronization pipelines.
            </p>
          </div>

          {/* User Custom Warning Message Box */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/50 text-slate-300 text-sm font-semibold leading-relaxed shadow-inner">
            {message}
          </div>

          <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Platform Status: Offline
            </p>
            <Link
              href="/login"
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
            >
              <span>Super Admin Access</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        {/* Minimal system signature */}
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-8 z-10">
          Powered by {brandName}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
