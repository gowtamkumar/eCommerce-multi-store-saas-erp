import { Star } from 'lucide-react';
import { PerformanceReview } from '../../hooks/usePerformanceManager';

export const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Unsatisfactory', color: 'text-rose-600' },
  2: { label: 'Needs Improvement', color: 'text-orange-500' },
  3: { label: 'Meets Expectations', color: 'text-amber-500' },
  4: { label: 'Exceeds Expectations', color: 'text-emerald-500' },
  5: { label: 'Outstanding', color: 'text-indigo-600' },
};

export const getScoreMeta = (score: number) => SCORE_LABELS[Math.round(score)] || SCORE_LABELS[3];

export const getEmployeeName = (employee: PerformanceReview['employee']) =>
  employee?.user?.name || employee?.user?.username || 'Unknown Employee';

export const getReviewerName = (review: PerformanceReview) =>
  review.reviewer?.user?.name || review.reviewer?.user?.username || 'Self / System';

export function ScoreStars({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.round(score)
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-200 dark:text-slate-700'
          }`}
        />
      ))}
    </div>
  );
}
