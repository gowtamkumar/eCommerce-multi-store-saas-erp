import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

export default function TrendBadge({ trend }: { trend?: string | null }) {
  if (!trend) {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg">
        <Minus className="w-3 h-3" /> No data
      </span>
    );
  }

  const isPositive = trend.startsWith('+');
  const isNegative = trend.startsWith('-');

  return (
    <span
      className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
        isPositive
          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
          : isNegative
            ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
            : 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
      }`}
    >
      {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      {trend}
    </span>
  );
}
