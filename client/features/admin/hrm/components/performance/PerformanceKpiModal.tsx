'use client';

import Modal from '@/components/shared/Modal';
import { PerformanceReview } from '../../hooks/usePerformanceManager';
import { getEmployeeName, getScoreMeta, ScoreStars } from './performanceUi';

interface PerformanceKpiModalProps {
  review: PerformanceReview | null;
  onClose: () => void;
}

export default function PerformanceKpiModal({ review, onClose }: PerformanceKpiModalProps) {
  const score = Number(review?.score || 0);
  const scoreMeta = getScoreMeta(score);

  return (
    <Modal
      open={!!review}
      onClose={onClose}
      title="KPI Breakdown"
      maxWidthClassName="max-w-2xl"
    >
      {review && (
        <div className="space-y-6">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest -mt-6">
            {getEmployeeName(review.employee)} - {review.reviewPeriod}
          </p>

          <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl">
            <div className="text-4xl font-black text-slate-900 dark:text-white">
              {score.toFixed(1)}
              <span className="text-lg text-slate-400">/5</span>
            </div>
            <div className="space-y-1">
              <ScoreStars score={score} />
              <span className={`text-xs font-black uppercase tracking-wide ${scoreMeta.color}`}>
                {scoreMeta.label}
              </span>
            </div>
          </div>

          {review.comments && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Manager Comments</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl">
                {review.comments}
              </p>
            </div>
          )}

          {review.kpi_metrics && review.kpi_metrics.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                KPI Metrics
              </p>
              <div className="space-y-3">
                {review.kpi_metrics.map((kpi, index) => {
                  const percent = kpi.target > 0 ? Math.min((kpi.achieved / kpi.target) * 100, 100) : 0;
                  return (
                    <div key={`${kpi.metric_name}-${index}`} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {kpi.metric_name}
                        </span>
                        <span className="text-xs font-black font-mono text-indigo-600">
                          {kpi.achieved} / {kpi.target}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-slate-400 font-semibold">{percent.toFixed(0)}% achieved</span>
                        <span className="text-[9px] text-slate-400 font-semibold">Score: {kpi.score}/5</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
