'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, Clock, Plus, Users } from 'lucide-react';
import { Applicant, JobPosting } from '../../hooks/useRecruitmentManager';
import { getJobStatusClassName } from './recruitmentUi';

interface RecruitmentJobBoardProps {
  jobs: JobPosting[];
  applicants: Applicant[];
  onViewApplicants: (jobId: string) => void;
  onAddApplicant: (jobId: string) => void;
}

export default function RecruitmentJobBoard({
  jobs,
  applicants,
  onViewApplicants,
  onAddApplicant,
}: RecruitmentJobBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {jobs.map((job) => (
          <motion.div
            key={job.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${getJobStatusClassName(job.status)}`}>
                  {job.status}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-2 leading-tight">{job.title}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{job.department?.name} - {job.location}</p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-bold">{applicants.filter((app) => app.jobPostingId === job.id).length} Applicants</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onViewApplicants(job.id)}
                  className="flex-1 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                >
                  View List
                </button>
                <button
                  onClick={() => onAddApplicant(job.id)}
                  className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                  title="Add Applicant"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
