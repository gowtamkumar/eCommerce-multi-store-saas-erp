'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Play, Layout, ShoppingBag, ShoppingCart, Users, Settings, TrendingUp, DollarSign, Calendar, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function MarketingHero({ data }: any) {
  const content = data || {
    badge: 'Enterprise Multi-Store SaaS ERP',
    title: 'Supercharge Your eCommerce & Retail Operations',
    description: 'A unified POS, Inventory, HRM, and multi-store management platform built for modern retail. Launch separate stores dynamically, control logistics, and monitor real-time insights from one sleek dashboard.',
    primaryBtnText: 'Start Free Trial',
    primaryBtnLink: '/create-store',
    secondaryBtnText: 'Compare Features',
    secondaryBtnLink: '#pricing',
  };

  return (
    <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-36 overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
      {/* Background Radial Glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-500/10 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[5%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50/80 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-widest mb-8 border border-brand-100 dark:border-brand-800/60 shadow-sm"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-600"></span>
            </span>
            {content.badge}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-display text-slate-900 dark:text-white mb-6 leading-[1.08] tracking-tight"
          >
            {content.title.split(' ').map((word: string, i: number) => {
              if (['eCommerce', 'Retail', 'Supercharge', 'Operations'].includes(word.replace(/[^a-zA-Z]/g, ''))) {
                return (
                  <span key={i} className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
                    {word}{' '}
                  </span>
                );
              }
              return word + ' ';
            })}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-3xl mx-auto font-medium"
          >
            {content.description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              href={content.primaryBtnLink || '#'}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-widest transition-all hover:shadow-2xl hover:shadow-brand-500/25 active:scale-95 group"
            >
              {content.primaryBtnText}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={content.secondaryBtnLink || '#'}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4.5 rounded-2xl bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-black text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-md shadow-slate-100 dark:shadow-none"
            >
              {content.secondaryBtnText}
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
          >
            {['Multi-Store Isolated Database', 'No credit card required', '14-day free trial'].map((text: string) => (
              <div key={text} className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, type: 'spring', stiffness: 50 }}
          className="mt-20 relative max-w-5xl mx-auto"
        >
          {/* Glass background shadow */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-brand-500/5 dark:to-indigo-500/5 blur-3xl -z-10 rounded-[3rem]" />
          
          <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-slate-900 text-slate-200 font-sans">
            {/* Window Header */}
            <div className="bg-slate-950/80 px-6 py-4 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-md">
              <div className="flex gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full text-xs text-slate-400 w-1/3 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                gowtam.localhost:3000/admin/dashboard
              </div>
              <div className="w-10" />
            </div>

            {/* Application Mock Body */}
            <div className="flex min-h-[500px]">
              {/* Mock Sidebar */}
              <aside className="w-16 sm:w-56 bg-slate-950/40 border-r border-slate-800/80 p-4 hidden xs:flex flex-col gap-6">
                <div className="flex items-center gap-3 px-2 py-1.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm">
                    G
                  </div>
                  <span className="font-bold text-sm hidden sm:block truncate">Gowtam Retail</span>
                </div>
                
                <nav className="flex flex-col gap-1">
                  {[
                    { icon: Layout, label: 'Dashboard', active: true },
                    { icon: ShoppingBag, label: 'Products SKU', active: false },
                    { icon: ShoppingCart, label: 'POS Checkout', active: false },
                    { icon: Users, label: 'Staff & HRM', active: false },
                    { icon: Settings, label: 'ERP Settings', active: false },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 px-3 py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        item.active
                          ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <item.icon className="w-4.5 h-4.5 shrink-0" />
                      <span className="hidden sm:block">{item.label}</span>
                    </div>
                  ))}
                </nav>
              </aside>

              {/* Mock Dashboard Content */}
              <main className="flex-1 p-6 sm:p-8 bg-slate-900/60 flex flex-col gap-6 text-left">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">Sales Dashboard</h2>
                    <p className="text-xs text-slate-400">Live multi-store sales & inventory metrics</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold">
                    <Calendar className="w-3.5 h-3.5 text-brand-400" />
                    Today: May 26, 2026
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Today's Gross Sales", value: "$12,450.80", change: "+14.2%", icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10" },
                    { label: "Active POS Registers", value: "4 / 4 Online", change: "100% Up", icon: Layout, color: "text-blue-500 bg-blue-500/10" },
                    { label: "Warehouse Stock SKUs", value: "1,285 Items", change: "Safe Levels", icon: ShoppingBag, color: "text-amber-500 bg-amber-500/10" },
                  ].map((metric, idx) => (
                    <div key={idx} className="p-5 rounded-2.5xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">{metric.label}</span>
                        <div className="text-lg sm:text-xl font-black text-white">{metric.value}</div>
                      </div>
                      <div className={`p-3 rounded-2xl ${metric.color} shrink-0`}>
                        <metric.icon className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sales Chart Mockup */}
                <div className="p-6 rounded-2.5xl bg-slate-950/50 border border-slate-800/60 flex-1 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Live Sales Velocity</span>
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                      +28.5% hourly spike
                    </div>
                  </div>
                  
                  {/* Fake visual bar chart */}
                  <div className="flex items-end justify-between h-40 gap-2 sm:gap-4 pt-4 border-b border-slate-800/80">
                    {[35, 48, 25, 60, 75, 50, 90, 65, 80, 100, 85, 95].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col justify-end h-full">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${val}%` }}
                          transition={{ duration: 1, delay: 0.6 + idx * 0.05, type: 'spring' }}
                          className={`w-full rounded-t-lg bg-gradient-to-t ${
                            idx === 9
                              ? 'from-indigo-600 to-brand-500 shadow-lg shadow-brand-500/20'
                              : 'from-slate-800 to-slate-700 group-hover:from-slate-700'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-[9px] uppercase font-black text-slate-500 tracking-wider px-1">
                    <span>9:00 AM</span>
                    <span>1:00 PM</span>
                    <span>5:00 PM</span>
                    <span>9:00 PM</span>
                  </div>
                </div>
              </main>
            </div>
          </div>

          {/* Fade out bottom overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent h-24 pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
