'use client';

import { Plus, Search } from 'lucide-react';
import {
  ApplicantStatus,
  ApplicantStatusFilter,
  JobPosting,
  JobStatusFilter,
  RecruitmentView,
} from '../../hooks/useRecruitmentManager';
import { getSearchPlaceholder } from './recruitmentUi';

interface RecruitmentControlsProps {
  view: RecruitmentView;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  jobStatusFilter: JobStatusFilter;
  setJobStatusFilter: (value: JobStatusFilter) => void;
  applicantStatusFilter: ApplicantStatusFilter;
  setApplicantStatusFilter: (value: ApplicantStatusFilter) => void;
  selectedJobId: string | null;
  setSelectedJobId: (value: string | null) => void;
  jobs: JobPosting[];
  onPostOpening: () => void;
}

export default function RecruitmentControls({
  view,
  searchQuery,
  setSearchQuery,
  jobStatusFilter,
  setJobStatusFilter,
  applicantStatusFilter,
  setApplicantStatusFilter,
  selectedJobId,
  setSelectedJobId,
  jobs,
  onPostOpening,
}: RecruitmentControlsProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder={getSearchPlaceholder(view)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {view === 'BOARD' ? (
          <select
            value={jobStatusFilter}
            onChange={(e) => setJobStatusFilter(e.target.value as JobStatusFilter)}
            className="w-full sm:w-auto px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
          >
            <option value="ALL">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CLOSED">Closed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        ) : (
          <>
            <select
              value={applicantStatusFilter}
              onChange={(e) => setApplicantStatusFilter(e.target.value as ApplicantStatusFilter)}
              className="w-full sm:w-auto px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
            >
              <option value="ALL">All stages</option>
              {Object.values(ApplicantStatus).map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            <select
              value={selectedJobId || ''}
              onChange={(e) => setSelectedJobId(e.target.value || null)}
              className="w-full sm:w-auto px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
            >
              <option value="">All jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </>
        )}

        {view === 'BOARD' && (
          <button
            onClick={onPostOpening}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Post Opening
          </button>
        )}
      </div>
    </div>
  );
}
