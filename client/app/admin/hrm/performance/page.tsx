'use client';

import { useMemo } from 'react';
import { Award, Plus } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import { usePerformanceManager } from '@/features/admin/hrm/hooks/usePerformanceManager';
import PerformanceSummaryCards from '@/features/admin/hrm/components/performance/PerformanceSummaryCards';
import PerformanceSearch from '@/features/admin/hrm/components/performance/PerformanceSearch';
import PerformanceKpiModal from '@/features/admin/hrm/components/performance/PerformanceKpiModal';
import CreatePerformanceReviewModal from '@/features/admin/hrm/components/performance/CreatePerformanceReviewModal';
import { buildPerformanceColumns } from '@/features/admin/hrm/components/performance/performanceColumns';

export default function PerformancePage() {
  const {
    reviews,
    employees,
    loading,
    search,
    setSearch,
    createOpen,
    setCreateOpen,
    selectedReview,
    setSelectedReview,
    reviewForm,
    updateReviewForm,
    handleAddKpi,
    handleKpiChange,
    handleSubmit,
    filteredReviews,
    avgScore,
    outstandingCount,
  } = usePerformanceManager();

  const columns = useMemo(
    () => buildPerformanceColumns({ onViewKpis: setSelectedReview }),
    [setSelectedReview]
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
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

      <PerformanceSummaryCards
        totalReviews={reviews.length}
        avgScore={avgScore}
        outstandingCount={outstandingCount}
      />

      <PerformanceSearch search={search} setSearch={setSearch} />

      <DataTable
        data={filteredReviews}
        columns={columns}
        getRowKey={(review) => review.id}
        loading={loading}
        loadingLabel="Loading performance reviews..."
        emptyLabel={
          <div className="flex flex-col items-center gap-2">
            <Award className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
              No Performance Reviews Yet
            </p>
            <p className="text-xs text-slate-400 mt-1 text-center">
              Click "New Review" to submit the first appraisal
            </p>
          </div>
        }
        containerClassName="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
        minWidthClassName="min-w-[1000px]"
      />

      <PerformanceKpiModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
      />

      <CreatePerformanceReviewModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        employees={employees}
        reviewForm={reviewForm}
        updateReviewForm={updateReviewForm}
        handleAddKpi={handleAddKpi}
        handleKpiChange={handleKpiChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
