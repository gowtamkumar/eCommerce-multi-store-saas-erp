'use client';

import { FormEvent } from 'react';
import { Award, Plus } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';
import {
  KpiMetric,
  PerformanceEmployee,
  PerformanceReviewForm,
} from '../../hooks/usePerformanceManager';
import { ScoreStars } from './performanceUi';

interface CreatePerformanceReviewModalProps {
  open: boolean;
  onClose: () => void;
  employees: PerformanceEmployee[];
  reviewForm: PerformanceReviewForm;
  updateReviewForm: <K extends keyof PerformanceReviewForm>(
    field: K,
    value: PerformanceReviewForm[K],
  ) => void;
  handleAddKpi: () => void;
  handleKpiChange: <K extends keyof KpiMetric>(
    index: number,
    field: K,
    value: KpiMetric[K],
  ) => void;
  onSubmit: (event: FormEvent) => void;
}

const compactFieldClassName = `${fieldControlClass} px-4 py-3 text-xs`;
const compactKpiFieldClassName = 'px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none';

export default function CreatePerformanceReviewModal({
  open,
  onClose,
  employees,
  reviewForm,
  updateReviewForm,
  handleAddKpi,
  handleKpiChange,
  onSubmit,
}: CreatePerformanceReviewModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={(
        <span className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-500" />
          New Performance Review
        </span>
      )}
      maxWidthClassName="max-w-2xl"
    >
      <form onSubmit={onSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Employee *">
            <select
              required
              value={reviewForm.employeeId}
              onChange={(e) => updateReviewForm('employeeId', e.target.value)}
              className={compactFieldClassName}
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.user?.name || employee.user?.username || employee.id}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Reviewer (optional)">
            <select
              value={reviewForm.reviewerId}
              onChange={(e) => updateReviewForm('reviewerId', e.target.value)}
              className={compactFieldClassName}
            >
              <option value="">Self / System</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.user?.name || employee.user?.username || employee.id}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Review Period *">
            <input
              type="text"
              required
              placeholder="e.g. 2026-Q1 or 2025 Annual"
              value={reviewForm.reviewPeriod}
              onChange={(e) => updateReviewForm('reviewPeriod', e.target.value)}
              className={compactFieldClassName}
            />
          </FormField>
          <FormField label="Overall Score (1-5) *">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={5}
                step={0.5}
                value={reviewForm.score}
                onChange={(e) => updateReviewForm('score', Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="text-sm font-black text-indigo-600 w-8 text-right">{reviewForm.score}</span>
            </div>
            <div className="mt-1">
              <ScoreStars score={reviewForm.score} />
            </div>
          </FormField>
        </div>

        <FormField label="Manager Comments">
          <textarea
            rows={3}
            value={reviewForm.comments}
            onChange={(e) => updateReviewForm('comments', e.target.value)}
            placeholder="Detailed appraisal notes..."
            className={`${compactFieldClassName} resize-none`}
          />
        </FormField>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              KPI Metrics
            </label>
            <button
              type="button"
              onClick={handleAddKpi}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Metric
            </button>
          </div>
          <div className="space-y-3">
            {reviewForm.kpiRows.map((kpi, index) => (
              <div key={index} className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Metric Name"
                  value={kpi.metric_name}
                  onChange={(e) => handleKpiChange(index, 'metric_name', e.target.value)}
                  className={`col-span-2 ${compactKpiFieldClassName}`}
                />
                <input
                  type="number"
                  placeholder="Target"
                  value={kpi.target || ''}
                  onChange={(e) => handleKpiChange(index, 'target', Number(e.target.value))}
                  className={compactKpiFieldClassName}
                />
                <input
                  type="number"
                  placeholder="Achieved"
                  value={kpi.achieved || ''}
                  onChange={(e) => handleKpiChange(index, 'achieved', Number(e.target.value))}
                  className={compactKpiFieldClassName}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
          >
            Submit Review
          </button>
        </div>
      </form>
    </Modal>
  );
}
