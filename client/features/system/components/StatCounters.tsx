'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Store, TrendingUp, Cpu, Globe2 } from 'lucide-react';

export default function StatCounters() {
  const stats = [
    {
      icon: Store,
      value: '10,250+',
      label: 'Merchant Stores Active',
      description: 'Stores launched and running globally',
      color: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
    },
    {
      icon: TrendingUp,
      value: '$150M+',
      label: 'Sales Volume Processed',
      description: 'Gross checkout value managed through POS & Web',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      icon: Cpu,
      value: '99.99%',
      label: 'Guaranteed SLA Uptime',
      description: 'Powered by highly available containerized clouds',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: Globe2,
      value: '150+',
      label: 'Currencies Supported',
      description: 'Accept payments globally with automatic localization',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/50 hover:shadow-xl hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 group text-left"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${stat.color}`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
                
                <h3 className="text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight mb-2">
                  {stat.value}
                </h3>
                
                <div className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">
                  {stat.label}
                </div>
                
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
