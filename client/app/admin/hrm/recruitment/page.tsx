'use client';

import { useMemo } from 'react';
import { Loader2, Users } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import {
  RecruitmentView,
  useRecruitmentManager,
} from '@/features/admin/hrm/hooks/useRecruitmentManager';
import RecruitmentControls from '@/features/admin/hrm/components/recruitment/RecruitmentControls';
import RecruitmentJobBoard from '@/features/admin/hrm/components/recruitment/RecruitmentJobBoard';
import RecruitmentPipeline from '@/features/admin/hrm/components/recruitment/RecruitmentPipeline';
import PostJobModal from '@/features/admin/hrm/components/recruitment/PostJobModal';
import ScheduleInterviewModal from '@/features/admin/hrm/components/recruitment/ScheduleInterviewModal';
import AddApplicantModal from '@/features/admin/hrm/components/recruitment/AddApplicantModal';
import { buildApplicantColumns } from '@/features/admin/hrm/components/recruitment/applicantColumns';

const VIEWS: Array<{ id: RecruitmentView; label: string }> = [
  { id: 'BOARD', label: 'Job Board' },
  { id: 'PIPELINE', label: 'Pipeline' },
  { id: 'APPLICANTS', label: 'List View' },
];

export default function RecruitmentManagementPage() {
  const {
    loading,
    submitting,
    jobs,
    applicants,
    employees,
    departments,
    filteredJobs,
    filteredApplicants,
    view,
    setView,
    searchQuery,
    setSearchQuery,
    showJobModal,
    setShowJobModal,
    showApplyModal,
    setShowApplyModal,
    showInterviewModal,
    setShowInterviewModal,
    selectedJobId,
    setSelectedJobId,
    jobStatusFilter,
    setJobStatusFilter,
    applicantStatusFilter,
    setApplicantStatusFilter,
    jobFormData,
    setJobFormData,
    applyFormData,
    setApplyFormData,
    interviewData,
    setInterviewData,
    isJobFormValid,
    isInterviewFormValid,
    handleCreateJob,
    handleStatusChange,
    handleScheduleInterview,
    handleApply,
    openJobApplicants,
  } = useRecruitmentManager();

  const columns = useMemo(
    () => buildApplicantColumns({
      onStatusChange: handleStatusChange,
      onScheduleInterview: setShowInterviewModal,
    }),
    [handleStatusChange, setShowInterviewModal]
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none">
            Talent <span className="text-indigo-600">Acquisition</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Orchestrating the recruitment lifecycle and hiring pipeline
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          {VIEWS.map((viewOption) => (
            <button
              key={viewOption.id}
              onClick={() => setView(viewOption.id)}
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === viewOption.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {viewOption.label}
            </button>
          ))}
        </div>
      </div>

      <RecruitmentControls
        view={view}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        jobStatusFilter={jobStatusFilter}
        setJobStatusFilter={setJobStatusFilter}
        applicantStatusFilter={applicantStatusFilter}
        setApplicantStatusFilter={setApplicantStatusFilter}
        selectedJobId={selectedJobId}
        setSelectedJobId={setSelectedJobId}
        jobs={jobs}
        onPostOpening={() => setShowJobModal(true)}
      />

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Synchronizing Talent Cloud...</p>
          </div>
        ) : view === 'PIPELINE' ? (
          <RecruitmentPipeline
            applicants={filteredApplicants}
            onStatusChange={handleStatusChange}
            onScheduleInterview={setShowInterviewModal}
          />
        ) : view === 'BOARD' ? (
          <RecruitmentJobBoard
            jobs={filteredJobs}
            applicants={applicants}
            onViewApplicants={openJobApplicants}
            onAddApplicant={setShowApplyModal}
          />
        ) : (
          <DataTable
            data={filteredApplicants}
            columns={columns}
            getRowKey={(app) => app.id}
            loading={loading}
            loadingLabel="Synchronizing Talent Cloud..."
            emptyLabel={
              <div className="py-12 text-center opacity-20 flex flex-col items-center">
                <Users className="w-8 h-8 mb-2" />
                <p className="text-[9px] font-black uppercase tracking-widest italic">No applicants found</p>
              </div>
            }
            containerClassName="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            minWidthClassName="min-w-[1000px]"
          />
        )}
      </div>

      <PostJobModal
        open={showJobModal}
        onClose={() => setShowJobModal(false)}
        departments={departments}
        jobFormData={jobFormData}
        setJobFormData={setJobFormData}
        submitting={submitting}
        isValid={isJobFormValid}
        onSubmit={handleCreateJob}
      />

      <ScheduleInterviewModal
        applicantId={showInterviewModal}
        onClose={() => setShowInterviewModal(null)}
        employees={employees}
        interviewData={interviewData}
        setInterviewData={setInterviewData}
        submitting={submitting}
        isValid={isInterviewFormValid}
        onSubmit={handleScheduleInterview}
      />

      <AddApplicantModal
        jobId={showApplyModal}
        onClose={() => setShowApplyModal(null)}
        applyFormData={applyFormData}
        setApplyFormData={setApplyFormData}
        submitting={submitting}
        onSubmit={handleApply}
      />
    </div>
  );
}
