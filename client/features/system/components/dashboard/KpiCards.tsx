'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, BarChart3, ChevronRight, Star, Store, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import TrendBadge from './TrendBadge';
import type { DashboardStats } from '../../types/dashboard.types';

interface KpiCard {
  label: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
  trend: string | null;
  link: string | null;
}

interface KpiCardsProps {
  stats: DashboardStats;
  isRefreshing: boolean;
}

export default function KpiCards({ stats, isRefreshing }: KpiCardsProps) {
  const cards = useMemo<KpiCard[]>(
    () => [
      { label: 'Total Stores', value: stats.totalStores, icon: Store, gradient: 'from-indigo-500 to-purple-600', trend: stats.trends?.stores || null, link: '/system/stores' },
      { label: 'Total Users', value: stats.totalUsers, icon: Users, gradient: 'from-emerald-500 to-teal-600', trend: stats.trends?.users || null, link: '/system/users' },
      { label: 'Total Orders', value: stats.totalOrders, icon: BarChart3, gradient: 'from-amber-500 to-orange-600', trend: stats.trends?.orders || null, link: '/system/billing' },
      { label: '24h Requests', value: stats.requestsLast24h, icon: Activity, gradient: 'from-blue-500 to-cyan-600', trend: stats.trends?.traffic || null, link: '/system/health' },
      { label: 'Reviews', value: stats.totalReviews || 0, icon: Star, gradient: 'from-pink-500 to-rose-600', trend: stats.trends?.reviews || null, link: '/system/stores' },
    ],
    [stats],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const inner = (
          <>
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-xl bg-linear-to-br ${card.gradient} text-white shadow-lg`}>
                <Icon className="w-5 h-5" />
              </div>
              <TrendBadge trend={card.trend} />
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{card.label}</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {isRefreshing ? (
                <span className="inline-block w-16 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : (
                card.value.toLocaleString()
              )}
            </p>
            {card.link && (
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                View all <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </>
        );

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            {card.link ? (
              <Link
                href={card.link}
                className="block bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group h-full"
              >
                {inner}
              </Link>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all group h-full">
                {inner}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
