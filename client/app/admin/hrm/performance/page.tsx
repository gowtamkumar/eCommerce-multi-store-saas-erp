'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Plus,
  X,
  Star,
  Search,
  BarChart3,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getPerformanceReviews,
  createPerformanceReview,
  getEmployees,
} from '@/services/hrm';

interface KpiMetric {
  metric_name: string;
  target: number;
  achieved: number;
  score: number;
}

interface PerformanceReview {
  id: string;
  reviewPeriod: string;
  score: number;
  comments: string;
  kpi_metrics: KpiMetric[] | null;
  employee: {
    id: string;
    user?: { name?: string; username?: string };
    department?: { name?: string };
  };
  reviewer?: {
    user?: { name?: string; username?: string };
  };
  createdAt: string;
}

interface Employee {
  id: string;
  user?: { name?: string; username?: string };
  department?: { name?: string };
  designation?: { name?: string };
}

const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Unsatisfactory', color: 'text-rose-600' },
  2: { label: 'Needs Improvement', color: 'text-orange-500' },
  3: { label: 'Meets Expectations', color: 'text-amber-500' },
  4: { label: 'Exceeds Expectations', color: 'text-emerald-500' },
  5: { label: 'Outstanding', color: 'text-indigo-600' },
};

function ScoreStars({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= Math.round(score)
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-200 dark:text-slate-700'
          }`}
        />
      ))}
    </div>
  );
}

export default function PerformancePage() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);

  // Form state
  const [empId, setEmpId] = useState('');
  const [reviewerId, setReviewerId] = useState('');
  const [reviewPeriod, setReviewPeriod] = useState('');
  const [score, setScore] = useState(3);
  const [comments, setComments] = useState('');
  const [kpiRows, setKpiRows] = useState<KpiMetric[]>([
    { metric_name: '', target: 0, achieved: 0, score: 0 },
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rev, emp] = await Promise.all([getPerformanceReviews(), getEmployees()]);
      setReviews(Array.isArray(rev) ? rev : []);
      setEmployees(Array.isArray(emp) ? emp : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () =>
      reviews.filter((r) => {
        const name =
          r.employee?.user?.name || r.employee?.user?.username || '';
        const dept = r.employee?.department?.name || '';
        return (
          name.toLowerCase().includes(search.toLowerCase()) ||
          r.reviewPeriod.toLowerCase().includes(search.toLowerCase()) ||
          dept.toLowerCase().includes(search.toLowerCase())
        );
      }),
    [reviews, search],
  );

  const avgScore =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + Number(r.score), 0) / reviews.length
      : 0;

  const outstandingCount = reviews.filter((r) => Number(r.score) >= 4.5).length;

  const handleAddKpi = () =>
    setKpiRows((prev) => [...prev, { metric_name: '', target: 0, achieved: 0, score: 0 }]);

  const handleKpiChange = (idx: number, field: keyof KpiMetric, value: string | number) => {
    setKpiRows((prev) => {
      const updated = [...prev];
      (updated[idx] as any)[field] = value;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId || !reviewPeriod) {
      toast.error('Employee and review period are required');
      return;
    }
    try {
      await createPerformanceReview({
        employeeId: empId,
        reviewerId: reviewerId || undefined,
        reviewPeriod,
        score,
        comments,
        kpi_metrics: kpiRows.filter((k) => k.metric_name.trim() !== ''),
      });
      toast.success('Performance review submitted successfully');
      setCreateOpen(false);
      setEmpId('');
      setReviewerId('');
      setReviewPeriod('');
      setScore(3);
      setComments('');
      setKpiRows([{ metric_name: '', target: 0, achieved: 0, score: 0 }]);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create review');
    }
  };

  const empName = (e: PerformanceReview['employee']) =>
    e?.user?.name || e?.user?.username || 'Unknown Employee';

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            Performance <span className="text-indigo-600">Tracking</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Employee KPI Reviews & Appraisal Management
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> New Review
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Total Reviews',
            value: reviews.length,
            icon: BarChart3,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
          },
          {
            label: 'Average Score',
            value: avgScore.toFixed(2) + ' / 5.00',
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
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
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

      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by employee or period..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm"
        />
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700">
          <Award className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
            No Performance Reviews Yet
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Click &ldquo;New Review&rdquo; to submit the first appraisal
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/30">
                  {['Employee', 'Department', 'Review Period', 'Score', 'Rating', 'Reviewer', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {filtered.map((review) => {
                  const scoreNum = Number(review.score);
                  const scoreMeta = SCORE_LABELS[Math.round(scoreNum)] || SCORE_LABELS[3];
                  return (
                    <tr
                      key={review.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <User className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {empName(review.employee)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500 font-semibold">
                          {review.employee?.department?.name || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                          {review.reviewPeriod}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-black ${scoreMeta.color}`}>
                          {scoreNum.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <ScoreStars score={scoreNum} />
                          <span className={`text-[9px] font-black uppercase tracking-wide ${scoreMeta.color}`}>
                            {scoreMeta.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500 font-semibold">
                          {review.reviewer?.user?.name ||
                            review.reviewer?.user?.username ||
                            'Self / System'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                        >
                          View KPIs
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KPI Detail Modal */}
      <AnimatePresence>
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    KPI Breakdown
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    {empName(selectedReview.employee)} · {selectedReview.reviewPeriod}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Overall Score */}
                <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl">
                  <div className="text-4xl font-black text-slate-900 dark:text-white">
                    {Number(selectedReview.score).toFixed(1)}
                    <span className="text-lg text-slate-400">/5</span>
                  </div>
                  <div className="space-y-1">
                    <ScoreStars score={Number(selectedReview.score)} />
                    <span className={`text-xs font-black uppercase tracking-wide ${SCORE_LABELS[Math.round(Number(selectedReview.score))]?.color}`}>
                      {SCORE_LABELS[Math.round(Number(selectedReview.score))]?.label}
                    </span>
                  </div>
                </div>

                {/* Comments */}
                {selectedReview.comments && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Manager Comments</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl">
                      {selectedReview.comments}
                    </p>
                  </div>
                )}

                {/* KPI Metrics */}
                {selectedReview.kpi_metrics && selectedReview.kpi_metrics.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      KPI Metrics
                    </p>
                    <div className="space-y-3">
                      {selectedReview.kpi_metrics.map((kpi, i) => {
                        const pct = kpi.target > 0 ? Math.min((kpi.achieved / kpi.target) * 100, 100) : 0;
                        return (
                          <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl space-y-2">
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
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[9px] text-slate-400 font-semibold">{pct.toFixed(0)}% achieved</span>
                              <span className="text-[9px] text-slate-400 font-semibold">Score: {kpi.score}/5</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Review Modal */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700 flex-shrink-0">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                  <Award className="w-5 h-5 text-indigo-500" />
                  New Performance Review
                </h2>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto">
                {/* Employee & Reviewer */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Employee *
                    </label>
                    <select
                      required
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.user?.name || emp.user?.username || emp.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Reviewer (optional)
                    </label>
                    <select
                      value={reviewerId}
                      onChange={(e) => setReviewerId(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    >
                      <option value="">Self / System</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.user?.name || emp.user?.username || emp.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Period & Score */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Review Period *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2026-Q1 or 2025 Annual"
                      value={reviewPeriod}
                      onChange={(e) => setReviewPeriod(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Overall Score (1–5) *
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={0.5}
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                        className="flex-1 accent-indigo-600"
                      />
                      <span className="text-sm font-black text-indigo-600 w-8 text-right">{score}</span>
                    </div>
                    <div className="mt-1">
                      <ScoreStars score={score} />
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Manager Comments
                  </label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Detailed appraisal notes..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs resize-none"
                  />
                </div>

                {/* KPI Metrics */}
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
                    {kpiRows.map((kpi, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2">
                        <input
                          type="text"
                          placeholder="Metric Name"
                          value={kpi.metric_name}
                          onChange={(e) => handleKpiChange(i, 'metric_name', e.target.value)}
                          className="col-span-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Target"
                          value={kpi.target || ''}
                          onChange={(e) => handleKpiChange(i, 'target', Number(e.target.value))}
                          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Achieved"
                          value={kpi.achieved || ''}
                          onChange={(e) => handleKpiChange(i, 'achieved', Number(e.target.value))}
                          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
