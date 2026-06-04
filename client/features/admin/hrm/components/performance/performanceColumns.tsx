import { User } from 'lucide-react';
import { DataTableColumn } from '@/components/shared/DataTable';
import { PerformanceReview } from '../../hooks/usePerformanceManager';
import { getEmployeeName, getReviewerName, getScoreMeta, ScoreStars } from './performanceUi';

interface BuildPerformanceColumnsArgs {
  onViewKpis: (review: PerformanceReview) => void;
}

export function buildPerformanceColumns({
  onViewKpis,
}: BuildPerformanceColumnsArgs): DataTableColumn<PerformanceReview>[] {
  return [
    {
      key: 'employee',
      header: 'Employee',
      cell: (review) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white">
            {getEmployeeName(review.employee)}
          </span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      cell: (review) => (
        <span className="text-xs text-slate-500 font-semibold">
          {review.employee?.department?.name || '-'}
        </span>
      ),
    },
    {
      key: 'reviewPeriod',
      header: 'Review Period',
      cell: (review) => (
        <span className="text-xs font-black font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
          {review.reviewPeriod}
        </span>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      cell: (review) => {
        const score = Number(review.score);
        return (
          <span className={`text-sm font-black ${getScoreMeta(score).color}`}>
            {score.toFixed(1)}
          </span>
        );
      },
    },
    {
      key: 'rating',
      header: 'Rating',
      cell: (review) => {
        const score = Number(review.score);
        const scoreMeta = getScoreMeta(score);
        return (
          <div className="space-y-1">
            <ScoreStars score={score} />
            <span className={`text-[9px] font-black uppercase tracking-wide ${scoreMeta.color}`}>
              {scoreMeta.label}
            </span>
          </div>
        );
      },
    },
    {
      key: 'reviewer',
      header: 'Reviewer',
      cell: (review) => (
        <span className="text-xs text-slate-500 font-semibold">
          {getReviewerName(review)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (review) => (
        <button
          onClick={() => onViewKpis(review)}
          className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
        >
          View KPIs
        </button>
      ),
    },
  ];
}
