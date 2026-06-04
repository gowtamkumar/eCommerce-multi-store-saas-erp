'use client';

import { motion } from 'framer-motion';
import { Award, BarChart3, LucideIcon, Star } from 'lucide-react';

interface PerformanceSummaryCardsProps {
  totalReviews: number;
  avgScore: number;
  outstandingCount: number;
}

interface SummaryCard {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export default function PerformanceSummaryCards({
  totalReviews,
  avgScore,
  outstandingCount,
}: PerformanceSummaryCardsProps) {
  const cards: SummaryCard[] = [
    {
      label: 'Total Reviews',
      value: totalReviews,
      icon: BarChart3,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      label: 'Average Score',
      value: `${avgScore.toFixed(2)} / 5.00`,
      icon: Star,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: 'Outstanding Staff',
      value: outstandingCount,
      icon: Award,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((stat) => (
        <motion.div
          key={stat.label}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-4xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
        >
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
              {stat.label}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stat.value}
            </span>
          </div>
          <div className={`p-3 rounded-2xl ${stat.bg}`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
